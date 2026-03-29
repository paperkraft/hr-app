"use server";

import { revalidatePath } from "next/cache";
import { leaveApplicationSchema } from "@/lib/validations/leave";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Ensures a LeaveBalance record exists for the given user, month, and year.
 * If not, creates one with default values.
 */
async function ensureBalance(userId: string, month: number, year: number) {
  const existing = await prisma.leaveBalance.findUnique({
    where: { userId_month_year: { userId, month, year } }
  });

  if (existing) return existing;

  // Create default balance for a new month
  return await prisma.leaveBalance.create({
    data: {
      userId,
      month,
      year,
      remainingFull: 2.0,
      remainingShort: 1,
      semiAnnualRemaining: 3,
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
  const month = startDate.getMonth() + 1;
  const year = startDate.getFullYear();

  try {
    const balance = await ensureBalance(userId, month, year);

    // Business Logic: Balance Checks
    if (data.category === "MONTHLY_POLICY_1") {
      if (data.duration === "FULL" && balance.remainingFull < 1) {
         return { error: "Insufficient Full Leave balance for Policy 1." };
      }
      if (data.duration === "HALF" && balance.remainingFull < 0.5) {
         return { error: "Insufficient balance for a Half Day." };
      }
      if (data.duration === "SHORT" && balance.remainingShort < 1) {
         return { error: "Insufficient Short Leave balance. You only get 1 per month." };
      }
    }

    if (data.category === "SEMI_ANNUAL_POLICY_2") {
      if (balance.semiAnnualRemaining < 1) {
        return { error: "You have exhausted your Semi-Annual leaves for this cycle." };
      }
    }

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

      // Perform deduction logic
      let updateData: any = {};
      
      if (request.category === "MONTHLY_POLICY_1") {
        if (request.duration === "FULL") {
          updateData.remainingFull = { decrement: 1 };
        } else if (request.duration === "HALF") {
          updateData.remainingFull = { decrement: 0.5 };
        } else if (request.duration === "SHORT") {
          updateData.remainingShort = { decrement: 1 };
        }
      } else if (request.category === "SEMI_ANNUAL_POLICY_2") {
        updateData.semiAnnualRemaining = { decrement: 1 };
      }

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
      // Just reject
      await prisma.leaveRequest.update({
        where: { id: requestId },
        data: { status }
      });
    }

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