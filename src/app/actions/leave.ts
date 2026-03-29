"use server";

import { revalidatePath } from "next/cache";
import { leaveApplicationSchema } from "@/lib/validations/leave";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Calculates accurate calendar days between two dates.
 */
function getDaysDifference(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Ensures a LeaveBalance record exists for the given user, month, and year.
 * If not, creates one while carrying forward semi-annual cycles correctly.
 */
async function ensureBalance(userId: string, month: number, year: number) {
  const existing = await prisma.leaveBalance.findUnique({
    where: { userId_month_year: { userId, month, year } }
  });

  if (existing) return existing;

  // Fetch the most recent balance record to determine carryovers
  const previousBalance = await prisma.leaveBalance.findFirst({
    where: { userId },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' }
    ]
  });

  let semiAnnualRemaining = 3; // Default for a new cycle

  if (previousBalance) {
    // Determine if we are in the same semi-annual cycle 
    // Cycle 1: Jan-Jun (1-6) | Cycle 2: Jul-Dec (7-12)
    const currentCycle = month <= 6 ? 1 : 2;
    const prevCycle = previousBalance.month <= 6 ? 1 : 2;

    if (currentCycle === prevCycle && year === previousBalance.year) {
      // Carry forward the previous balance since we are in the same 6-month cycle
      semiAnnualRemaining = previousBalance.semiAnnualRemaining;
    }
  }

  // Create default balance for the new month
  return await prisma.leaveBalance.create({
    data: {
      userId,
      month,
      year,
      remainingFull: 2.0, // Resets every month
      remainingShort: 1,  // Resets every month
      semiAnnualRemaining,
    }
  });
}

export async function submitLeaveRequest(formData: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "You must be logged in to submit a leave request." };
  }

  const userId = session.user.id;
  const parsed = leaveApplicationSchema.safeParse(formData);

  if (!parsed.success) {
    return { error: "Invalid form data. Please check your inputs." };
  }

  const data = parsed.data;
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const month = startDate.getMonth() + 1;
  const year = startDate.getFullYear();

  // Calculate actual days requested
  const diffDays = getDaysDifference(startDate, endDate);

  try {
    const balance = await ensureBalance(userId, month, year);

    // Business Logic: Balance Checks
    if (data.category === "MONTHLY_POLICY_1") {
      const neededFull = data.duration === "HALF" ? 0.5 * diffDays : diffDays;

      if ((data.duration === "FULL" || data.duration === "HALF") && balance.remainingFull < neededFull) {
        return { error: `Insufficient balance. You need ${neededFull} days but have ${balance.remainingFull}.` };
      }
      if (data.duration === "SHORT" && balance.remainingShort < 1) {
        return { error: "Insufficient Short Leave balance. You only get 1 per month." };
      }
    }

    if (data.category === "SEMI_ANNUAL_POLICY_2") {
      if (balance.semiAnnualRemaining < diffDays) {
        return { error: `Insufficient Semi-Annual leaves. You need ${diffDays} days but have ${balance.semiAnnualRemaining}.` };
      }
    }

    // Notice we do NOTHING for "UNPAID". We just let it pass through and create the request.

    await prisma.leaveRequest.create({
      data: {
        userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        duration: data.duration,
        category: data.category,
        reason: data.reason,
      }
    });

    revalidatePath("/dashboard/employee");
    return { success: true };
  } catch (error) {
    console.error("Leave submission error:", error);
    return { error: "An unexpected error occurred while submitting your request." };
  }
}

export async function updateLeaveStatus(requestId: string, status: "APPROVED" | "REJECTED") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return { error: "Unauthorized. Managers or Admins only." };
  }

  try {
    const request = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!request) return { error: "Leave request not found." };
    if (request.status !== "PENDING") return { error: "Request has already been processed." };

    if (status === "APPROVED") {
      const month = request.startDate.getMonth() + 1;
      const year = request.startDate.getFullYear();
      const balance = await ensureBalance(request.userId, month, year);

      const diffDays = getDaysDifference(request.startDate, request.endDate);

      // Perform deduction logic, capping at available balance to prevent negative numbers.
      // Any overflow is inherently treated as LWP (Leave Without Pay).
      let updateData: any = {};
      let deductFromBalance = false;

      if (request.category === "MONTHLY_POLICY_1") {
        deductFromBalance = true;
        if (request.duration === "FULL") {
          const deductAmount = Math.min(balance.remainingFull, diffDays);
          updateData.remainingFull = { decrement: deductAmount };
        } else if (request.duration === "HALF") {
          const deductAmount = Math.min(balance.remainingFull, 0.5 * diffDays);
          updateData.remainingFull = { decrement: deductAmount };
        } else if (request.duration === "SHORT") {
          const deductAmount = Math.min(balance.remainingShort, 1);
          updateData.remainingShort = { decrement: deductAmount };
        }
      } else if (request.category === "SEMI_ANNUAL_POLICY_2") {
        deductFromBalance = true;
        const deductAmount = Math.min(balance.semiAnnualRemaining, diffDays);
        updateData.semiAnnualRemaining = { decrement: deductAmount };
      }

      if (deductFromBalance) {
        // Atomic update of balance and request status
        await prisma.$transaction([
          prisma.leaveBalance.update({
            where: { id: balance.id },
            data: updateData
          }),
          prisma.leaveRequest.update({
            where: { id: requestId },
            data: { status }
          })
        ]);
      } else {
        // Just approve the request, no balance deduction needed for LWP
        await prisma.leaveRequest.update({
          where: { id: requestId },
          data: { status }
        });
      }
    } else {
      // Just reject without altering balance
      await prisma.leaveRequest.update({
        where: { id: requestId },
        data: { status }
      });
    }

    // Revalidate paths to update UI instantly
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/employee");
    revalidatePath("/dashboard/manager");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/accountant");
    return { success: true };
  } catch (error) {
    console.error("Status update error:", error);
    return { error: "Failed to update request status." };
  }
}