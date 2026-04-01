"use server";

import { revalidatePath } from "next/cache";
import { leaveApplicationSchema } from "@/lib/validations/leave";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getDaysDifference(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
}

function getCycleRange(month: number, year: number) {
  // H1: Apr (4) to Sep (9)
  // H2: Oct (10) to Mar (next year 3)
  if (month >= 4 && month <= 9) {
    return {
      start: new Date(year, 3, 1), // April 1st
      end: new Date(year, 8, 30, 23, 59, 59) // Sep 30th
    };
  } else if (month >= 10) {
    return {
      start: new Date(year, 9, 1), // Oct 1st
      end: new Date(year + 1, 2, 31, 23, 59, 59) // Mar 31st
    };
  } else {
    // Jan-Mar belongs to previous year's Oct cycle
    return {
      start: new Date(year - 1, 9, 1), // Oct 1st Prev Year
      end: new Date(year, 2, 31, 23, 59, 59) // Mar 31st
    };
  }
}

async function getCyclePendingDays(userId: string, cycleStart: Date, cycleEnd: Date) {
  const pendingRequests = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: "PENDING",
      category: "SEMI_ANNUAL_POLICY_2",
      startDate: { gte: cycleStart },
      endDate: { lte: cycleEnd }
    }
  });

  return pendingRequests.reduce((acc, req) => acc + getDaysDifference(req.startDate, req.endDate), 0);
}

export async function ensureBalance(userId: string, month: number, year: number): Promise<any> {
  const existing = await prisma.leaveBalance.findUnique({
    where: { userId_month_year: { userId, month, year } }
  });

  if (existing) return existing;

  // 1. Find the MOST RECENT existing balance record
  const lastRecord = await prisma.leaveBalance.findFirst({
    where: {
      userId,
      OR: [
        { year: { lt: year } },
        { AND: [{ year: year }, { month: { lt: month } }] }
      ]
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' }
    ]
  });

  let carryForward = 0.0;
  let semiAnnualRemaining = 3;

  if (lastRecord) {
    // Check if the last record is the IMMEDIATE previous month
    const isPreviousMonth = (lastRecord.year === year && lastRecord.month === month - 1) ||
                            (lastRecord.year === year - 1 && lastRecord.month === 12 && month === 1);

    if (isPreviousMonth) {
      // Direct carry forward: min(remaining, 1.0)
      carryForward = Math.min(lastRecord.remainingFull, 1.0);
      
      // Update the previous month's record with its calculated CF and Encashment for descriptive accuracy
      await prisma.leaveBalance.update({
        where: { id: lastRecord.id },
        data: {
          carriedForward: carryForward,
          encashed: Math.max(0, lastRecord.remainingFull - carryForward)
        }
      });
    } else {
      // There is a GAP. We must recursively ensure the PREVIOUS month exists first!
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      
      // Creating the previous month's record will also handle the carry-forward logic for us!
      const createdPrev = await ensureBalance(userId, prevMonth, prevYear);
      carryForward = Math.min(createdPrev.remainingFull, 1.0);
      
      // Update the previous month's record
      await prisma.leaveBalance.update({
        where: { id: createdPrev.id },
        data: {
          carriedForward: carryForward,
          encashed: Math.max(0, createdPrev.remainingFull - carryForward)
        }
      });
    }

    // Semi-annual cycle logic: Cycle 1 (Apr-Sep), Cycle 2 (Oct-Mar)
    const getCycleKey = (m: number, y: number) => {
      if (m >= 4 && m <= 9) return `${y}-H1`; // Apr-Sep
      if (m >= 10) return `${y}-H2`;           // Oct-Dec
      return `${y - 1}-H2`;                    // Jan-Mar belongs to previous year's Oct cycle
    };

    const targetCycle = getCycleKey(month, year);
    const lastRecordCycle = getCycleKey(lastRecord.month, lastRecord.year);

    if (targetCycle === lastRecordCycle) {
      // Note: If we just created the prev month via ensureBalance, 
      // the semiAnnualRemaining will be correct in that record.
      const freshPrev = await prisma.leaveBalance.findFirst({
        where: { userId, month: (month === 1 ? 12 : month - 1), year: (month === 1 ? year - 1 : year) }
      });
      semiAnnualRemaining = freshPrev?.semiAnnualRemaining ?? lastRecord.semiAnnualRemaining;
    }
  }

  try {
    return await prisma.leaveBalance.create({
      data: {
        userId,
        month,
        year,
        remainingFull: 2.0 + carryForward, // Base allocation 2 + Carry Forward
        remainingShort: 1, // Monthly 1 short leave
        semiAnnualRemaining,
        carriedForward: 0.0, // This month's CF will be set when the NEXT month is created
        encashed: 0.0,
      }
    });
  } catch (e) {
    // Handle race condition if two processes try to ensure balance at once
    return await prisma.leaveBalance.findUniqueOrThrow({
      where: { userId_month_year: { userId, month, year } }
    });
  }
}

/**
 * Counts the leave "cost" already reserved by PENDING requests
 * for a given user, month, and year.
 */
async function getPendingCost(userId: string, month: number, year: number) {
  const pendingRequests = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: "PENDING",
      startDate: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1),
      },
    },
  });

  let pendingFull = 0;
  let pendingShort = 0;
  let pendingSemiAnnual = 0;

  for (const req of pendingRequests) {
    const diffDays = getDaysDifference(req.startDate, req.endDate);
    if (req.category === "MONTHLY_POLICY_1") {
      if (req.duration === "FULL") {
        pendingFull += diffDays;
      } else if (req.duration === "HALF") {
        pendingFull += 0.5 * diffDays;
      } else if (req.duration === "SHORT") {
        pendingShort += 1;
      }
    } else if (req.category === "SEMI_ANNUAL_POLICY_2") {
      pendingSemiAnnual += diffDays;
    }
  }

  return { pendingFull, pendingShort, pendingSemiAnnual };
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

  try {
    const diffDays = getDaysDifference(startDate, endDate);
    
    const balance = await ensureBalance(userId, month, year);

    // Policy 2 Enforcement
    if (data.category === "SEMI_ANNUAL_POLICY_2") {
      // 1. Minimum 3 continuous leaves
      if (diffDays < 3) {
        return { 
          error: "Policy 2 (Semi-Annual) requires a minimum of 3 consecutive leave days. Single or 2-day requests are not allowed for this category." 
        };
      }

      // 2. Quota Enforcement
      const cycle = getCycleRange(month, year);
      const pendingDays = await getCyclePendingDays(userId, cycle.start, cycle.end);
      const available = balance.semiAnnualRemaining - pendingDays;

      if (diffDays > available) {
        return { 
          error: `Policy 2 quota exceeded. Available semi-annual balance: ${balance.semiAnnualRemaining} days. Already pending in this cycle: ${pendingDays} days. Remaining quota: ${available} days. You are trying to apply for ${diffDays} days.` 
        };
      }
    }

    // Overlap Check: Prevent multiple active leaves for the same date range
    const existingOverlap = await prisma.leaveRequest.findFirst({
      where: {
        userId,
        status: { in: ["PENDING", "APPROVED"] },
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
    });

    if (existingOverlap) {
      return { 
        error: "You already have a leave request (Pending or Approved) for the selected dates. Please check your existing leaves." 
      };
    }

    await prisma.leaveRequest.create({
      data: {
        userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        duration: data.duration,
        category: data.category,
        reason: data.reason,
        startTime: data.startTime,
        endTime: data.endTime,
      }
    });

    revalidatePath("/dashboard/employee");
    return { success: true };
  } catch (error) {
    console.error("Leave submission error:", error);
    return { error: "An unexpected error occurred while submitting your request." };
  }
}

export async function updateLeaveStatus(requestId: string, status: "APPROVED" | "REJECTED", note?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    return { error: "Unauthorized. Managers or Admins only." };
  }

  try {
    const requestMeta = await prisma.leaveRequest.findUnique({ 
      where: { id: requestId } 
    });

    if (!requestMeta) return { error: "Request not found." };
    if (requestMeta.status !== "PENDING") return { success: true };

    const month = requestMeta.startDate.getMonth() + 1;
    const year = requestMeta.startDate.getFullYear();

    // Ensure balance record exists before starting transaction
    await ensureBalance(requestMeta.userId, month, year);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Re-fetch request metadata inside transaction
      const txRequest = await tx.leaveRequest.findUnique({ 
        where: { id: requestId } 
      });

      if (!txRequest || txRequest.status !== "PENDING") {
        return { success: true }; // Already processed by someone else
      }

      if (status === "REJECTED") {
        await tx.leaveRequest.update({ 
          where: { id: requestId }, 
          data: { 
            status: "REJECTED",
            managerNote: note || null
          } 
        });
        return { success: true };
      }

      // 2. Fetch current balance
      const month = txRequest.startDate.getMonth() + 1;
      const year = txRequest.startDate.getFullYear();
      
      // Ensure balance record exists (tx aware)
      const balance = await tx.leaveBalance.findUnique({
        where: { userId_month_year: { userId: txRequest.userId, month, year } }
      });

      // If no balance record exists, we probably need to create it, 
      // but ensureBalance is non-transactional currently. 
      // For safety, assume it exists or fail this tx as it's a rare edge case.
      if (!balance) throw new Error("BALANCE_NOT_FOUND");

      const diffDays = getDaysDifference(txRequest.startDate, txRequest.endDate);
      let deductAmount = 0;
      let balanceField: "remainingFull" | "remainingShort" | "semiAnnualRemaining" | null = null;
      let requestedNeeded = 0;

      // 3. Calculate deduction and LWP overflow
      if (txRequest.category === "MONTHLY_POLICY_1") {
        if (txRequest.duration === "FULL") {
          requestedNeeded = diffDays;
          balanceField = "remainingFull";
        } else if (txRequest.duration === "HALF") {
          requestedNeeded = 0.5 * diffDays;
          balanceField = "remainingFull";
        } else if (txRequest.duration === "SHORT") {
          requestedNeeded = 1;
          balanceField = "remainingShort";
        }
      } else if (txRequest.category === "SEMI_ANNUAL_POLICY_2") {
        requestedNeeded = diffDays;
        balanceField = "semiAnnualRemaining";
      }

      let overflowLwp = 0;
      let newManagerNote = note || "";

      if (balanceField) {
        const available = Number(balance[balanceField]);
        deductAmount = Math.min(available, requestedNeeded);
        overflowLwp = requestedNeeded - deductAmount;

        // Perform the deduction
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: {
            [balanceField]: { decrement: deductAmount }
          }
        });

        // Add LWP tag to manager notes if any
        if (overflowLwp > 0) {
          const sep = newManagerNote ? " | " : "";
          newManagerNote += `${sep}[Auto-LWP: ${overflowLwp}]`;
        }
      }

      // 4. Update the request status
      await tx.leaveRequest.update({
        where: { id: requestId },
        data: { 
          status: "APPROVED",
          managerNote: newManagerNote || null
        }
      });

      // 5. Cascade Carry-Forward & Cycle logic
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;

      const nextBalance = await tx.leaveBalance.findUnique({
        where: { userId_month_year: { userId: txRequest.userId, month: nextMonth, year: nextYear } }
      });

      if (nextBalance) {
        if (balanceField === "remainingFull") {
          // Carry-forward cascade (unchanged)
          const currentRemaining = Number(balance["remainingFull"]) - deductAmount;
          const updatedCF = Math.min(currentRemaining, 1.0);
          const cfDiff = updatedCF - nextBalance.carriedForward;

          if (cfDiff !== 0) {
            await tx.leaveBalance.update({
              where: { id: nextBalance.id },
              data: {
                carriedForward: updatedCF,
                remainingFull: { increment: cfDiff },
                encashed: Math.max(0, currentRemaining - updatedCF)
              }
            });
          }
        } else if (balanceField === "semiAnnualRemaining") {
          // Semi-annual cascade: only if same cycle
          const getCK = (m: number, y: number) => {
            if (m >= 4 && m <= 9) return `${y}-H1`;
            if (m >= 10) return `${y}-H2`;
            return `${y - 1}-H2`;
          };

          if (getCK(month, year) === getCK(nextMonth, nextYear)) {
            await tx.leaveBalance.update({
              where: { id: nextBalance.id },
              data: {
                semiAnnualRemaining: { decrement: deductAmount }
              }
            });
          }
        }
      }

      return { success: true };
    }, {
      // Use Serializable or at least something strong for balance updates
      isolationLevel: "Serializable"
    });

    // Refresh UIs
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/employee");
    revalidatePath("/dashboard/manager");
    
    return result;

  } catch (error: any) {
    console.error("Status update error:", error);
    if (error.message === "BALANCE_NOT_FOUND") {
      return { error: "Leave balance record not found for this month. Please ask admin to check policy initialization." };
    }
    return { error: "Failed to update request status. This might be a temporary conflict, please try again." };
  }
}