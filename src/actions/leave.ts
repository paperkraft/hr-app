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

function getCycleRange(month: number, year: number, startMonth: number = 4) {
  // relativeMonth: 0 means startMonth, 11 means startMonth-1
  const relativeMonth = (month - startMonth + 12) % 12;
  const isH1 = relativeMonth < 6;
  
  const cycleStartMonth = isH1 ? startMonth : ((startMonth + 6) % 12 || 12);
  const cycleEndMonth = isH1 ? ((startMonth + 5) % 12 || 12) : ((startMonth + 11) % 12 || 12);
  
  // If the current month belongs to a cycle that started last year (e.g. Jan in an Oct-Mar cycle)
  const cycleStartedLastYear = month < cycleStartMonth && cycleEndMonth >= month;
  const cycleSpansToNextYear = cycleEndMonth < cycleStartMonth;

  let startYear = year;
  if (cycleStartedLastYear) startYear = year - 1;

  let endYear = startYear;
  if (cycleSpansToNextYear) endYear = startYear + 1;

  return {
    start: new Date(startYear, cycleStartMonth - 1, 1),
    end: new Date(endYear, cycleEndMonth, 0, 23, 59, 59)
  };
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

export async function ensureBalance(userId: string, month: number, year: number, configStartMonth?: number): Promise<any> {
  const existing = await prisma.leaveBalance.findUnique({
    where: { userId_month_year: { userId, month, year } }
  });

  if (existing) return existing;

  // Fetch config if not provided (for recursion root)
  let startMonth = configStartMonth;
  if (startMonth === undefined) {
    const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });
    startMonth = config?.semiAnnualCycleStartMonth ?? 4;
  }

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
    const isPreviousMonth = (lastRecord.year === year && lastRecord.month === month - 1) ||
                            (lastRecord.year === year - 1 && lastRecord.month === 12 && month === 1);

    if (isPreviousMonth) {
      carryForward = Math.min(lastRecord.remainingFull, 1.0);
      await prisma.leaveBalance.update({
        where: { id: lastRecord.id },
        data: {
          carriedForward: carryForward,
          encashed: Math.max(0, lastRecord.remainingFull - carryForward)
        }
      });
    } else {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      
      const createdPrev = await ensureBalance(userId, prevMonth, prevYear, startMonth);
      carryForward = Math.min(createdPrev.remainingFull, 1.0);
      
      await prisma.leaveBalance.update({
        where: { id: createdPrev.id },
        data: {
          carriedForward: carryForward,
          encashed: Math.max(0, createdPrev.remainingFull - carryForward)
        }
      });
    }

    // Dynamic Semi-annual cycle logic
    const getCycleKey = (m: number, y: number, sM: number) => {
      const rel = (m - sM + 12) % 12;
      const isH1 = rel < 6;
      const cycleStartMonth = isH1 ? sM : ((sM + 6) % 12 || 12);
      const cycleStartedLastYear = m < cycleStartMonth && ((sM + 5) % 12 || 12) >= m;
      
      const yearPrefix = cycleStartedLastYear ? y - 1 : y;
      return `${yearPrefix}-${isH1 ? "H1" : "H2"}`;
    };

    const targetCycle = getCycleKey(month, year, startMonth ?? 4);
    const lastRecordCycle = getCycleKey(lastRecord.month, lastRecord.year, startMonth ?? 4);

    if (targetCycle === lastRecordCycle) {
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
        remainingFull: 2.0 + carryForward,
        remainingShort: 1,
        semiAnnualRemaining,
        carriedForward: 0.0,
        encashed: 0.0,
      }
    });
  } catch (e) {
    return await prisma.leaveBalance.findUniqueOrThrow({
      where: { userId_month_year: { userId, month, year } }
    });
  }
}

function splitLeaveIntoMonths(start: Date, end: Date) {
  const parts: { month: number; year: number; days: number }[] = [];
  let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const final = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= final) {
    const m = current.getMonth();
    const y = current.getFullYear();
    const monthStart = new Date(y, m, 1);
    const nextMonthStart = new Date(y, m + 1, 1);
    
    const partStart = current > monthStart ? current : monthStart;
    const partEnd = final < nextMonthStart ? final : new Date(y, m + 1, 0);

    parts.push({
      month: m + 1,
      year: y,
      days: getDaysDifference(partStart, partEnd),
    });

    current = nextMonthStart;
  }
  return parts;
}

/**
 * Counts the leave "cost" already reserved by PENDING requests
 * for a given user, month, and year.
 */
async function getPendingCost(userId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const pendingRequests = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: "PENDING",
      OR: [
        { startDate: { lte: endOfMonth }, endDate: { gte: startOfMonth } }
      ]
    },
  });

  let pendingFull = 0;
  let pendingShort = 0;
  let pendingSemiAnnual = 0;

  for (const req of pendingRequests) {
    const monthParts = splitLeaveIntoMonths(req.startDate, req.endDate);
    const part = monthParts.find(p => p.month === month && p.year === year);
    if (!part) continue;

    if (req.category === "MONTHLY_POLICY_1") {
      if (req.duration === "FULL") {
        pendingFull += part.days;
      } else if (req.duration === "HALF") {
        pendingFull += 0.5 * part.days;
      } else if (req.duration === "SHORT") {
        // Short leaves are typically 1 day only, but handle consistently
        pendingShort += 1;
      }
    } else if (req.category === "SEMI_ANNUAL_POLICY_2") {
      pendingSemiAnnual += part.days;
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
    return { error: "Invalid form data: " + parsed.error.message };
  }

  const data = parsed.data;
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const month = startDate.getMonth() + 1;
  const year = startDate.getFullYear();

  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });
    
    // Policy Toggle: Semi-Annual
    if (data.category === "SEMI_ANNUAL_POLICY_2" && !config?.semiAnnualPolicyEnabled) {
      return { error: "Semi-annual leave policy is currently disabled by administrator." };
    }

    const diffDays = getDaysDifference(startDate, endDate);
    const balance = await ensureBalance(userId, month, year, config?.semiAnnualCycleStartMonth);

    // Policy 2 Enforcement
    if (data.category === "SEMI_ANNUAL_POLICY_2") {
      if (diffDays < 3) {
        return { 
          error: "Policy 2 (Semi-Annual) requires a minimum of 3 consecutive leave days." 
        };
      }

      const cycle = getCycleRange(month, year, config?.semiAnnualCycleStartMonth);
      const pendingDays = await getCyclePendingDays(userId, cycle.start, cycle.end);
      const available = balance.semiAnnualRemaining - pendingDays;

      if (diffDays > available) {
        return { 
          error: `Policy 2 quota exceeded. Remaining quota: ${available} days. You are trying to apply for ${diffDays} days.` 
        };
      }
    }

    // Overlap Check
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
      return { error: "You already have a leave request for the selected dates." };
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
        halfDayType: data.halfDayType, // New field
      }
    });

    revalidatePath("/dashboard/employee");
    revalidatePath("/dashboard/employee/leaves");
    return { success: true };
  } catch (error) {
    console.error("Leave submission error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateLeaveStatus(requestId: string, status: "APPROVED" | "REJECTED", note?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Login required." };

  const { id: currentUserId, role, isTeamLeader } = session.user as any;
  const isAdmin = role === "ADMIN" || role === "SYSTEM_ADMIN";

  try {
    const requestMeta = await prisma.leaveRequest.findUnique({ 
      where: { id: requestId },
      include: { user: { select: { id: true, managerId: true, departmentId: true } } }
    });

    if (!requestMeta) return { error: "Request not found." };
    if (requestMeta.status !== "PENDING") return { success: true };

    // Authorization logic
    const isDirectManager = requestMeta.user.managerId === currentUserId;
    let isDeptLeader = false;

    if (isTeamLeader && requestMeta.user.departmentId) {
      const dept = await prisma.department.findUnique({
        where: { id: requestMeta.user.departmentId },
        select: { teamLeaderId: true }
      });
      isDeptLeader = dept?.teamLeaderId === currentUserId;
    }

    if (!isAdmin && !isDeptLeader && !isDirectManager) {
      return { error: "Unauthorized. Team Leaders or Direct Managers only." };
    }

    // Additional check for Managers/Leaders: ensure they supervise this specific user
    if (!isAdmin && !isDirectManager && !isDeptLeader) {
       return { error: "Unauthorized. You do not supervise this employee's leave requests." };
    }

    // Ensure balance record exists for all months covered by the leave
    const leaveMonths = splitLeaveIntoMonths(requestMeta.startDate, requestMeta.endDate);
    for (const m of leaveMonths) {
      await ensureBalance(requestMeta.userId, m.month, m.year);
    }

    const result = await prisma.$transaction(async (tx) => {
      const txRequest = await tx.leaveRequest.findUnique({ 
        where: { id: requestId } 
      });

      if (!txRequest || txRequest.status !== "PENDING") return { success: true };

      if (status === "REJECTED") {
        await tx.leaveRequest.update({ 
          where: { id: requestId }, 
          data: { status: "REJECTED", managerNote: note || null } 
        });
        return { success: true };
      }

      let totalOverflowLwp = 0;
      const monthParts = splitLeaveIntoMonths(txRequest.startDate, txRequest.endDate);
      
      for (const part of monthParts) {
        const balance = await tx.leaveBalance.findUnique({
          where: { userId_month_year: { userId: txRequest.userId, month: part.month, year: part.year } }
        });
        if (!balance) throw new Error(`BALANCE_NOT_FOUND_FOR_${part.month}_${part.year}`);

        let requestedNeeded = 0;
        let balanceField: "remainingFull" | "remainingShort" | "semiAnnualRemaining" | null = null;

        if (txRequest.category === "MONTHLY_POLICY_1") {
          if (txRequest.duration === "FULL") {
            requestedNeeded = part.days;
            balanceField = "remainingFull";
          } else if (txRequest.duration === "HALF") {
            requestedNeeded = 0.5 * part.days;
            balanceField = "remainingFull";
          } else if (txRequest.duration === "SHORT") {
            requestedNeeded = 1;
            balanceField = "remainingShort";
          }
        } else if (txRequest.category === "SEMI_ANNUAL_POLICY_2") {
          requestedNeeded = part.days;
          balanceField = "semiAnnualRemaining";
        }

        if (balanceField) {
          const available = Number(balance[balanceField]);
          const deductAmount = Math.min(available, requestedNeeded);
          totalOverflowLwp += (requestedNeeded - deductAmount);

          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: { [balanceField]: { decrement: deductAmount } }
          });
        }
      }

      let newManagerNote = note || "";
      if (totalOverflowLwp > 0) {
        const sep = newManagerNote ? " | " : "";
        newManagerNote += `${sep}[Auto-LWP: ${totalOverflowLwp}]`;
      }

      await tx.leaveRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED", managerNote: newManagerNote || null }
      });

      // Cascade updates for all subsequent months
      const config = await tx.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });
      const startMonthConfig = (config as any)?.semiAnnualCycleStartMonth ?? 4;
      
      const firstMonth = monthParts[0];
      let m = firstMonth.month;
      let y = firstMonth.year;

      while (true) {
        const current = await tx.leaveBalance.findFirst({
          where: { userId: txRequest.userId, month: m, year: y }
        });
        if (!current) break;

        const nextM = m === 12 ? 1 : m + 1;
        const nextY = m === 12 ? y + 1 : y;

        const next = await tx.leaveBalance.findFirst({
          where: { userId: txRequest.userId, month: nextM, year: nextY }
        });
        if (!next) break;

        // Correct Calculation: 
        // 1. Current month's balance determines what is carried forward into Next.
        const newCFFromCurrent = Math.min(Number(current.remainingFull), 1.0);
        const oldCFInNext = Number(next.carriedForward);
        const cfDiff = newCFFromCurrent - oldCFInNext;
        const currentEncashed = Math.max(0, Number(current.remainingFull) - newCFFromCurrent);

        // 2. Update stats for Current month (what it passes forward)
        await tx.leaveBalance.update({
          where: { id: current.id },
          data: {
            carriedForward: newCFFromCurrent,
            encashed: currentEncashed
          }
        });

        // 3. Update balance for Next month based on the change in its starting carry-forward
        if (cfDiff !== 0) {
          await tx.leaveBalance.update({
            where: { id: next.id },
            data: {
              remainingFull: { increment: cfDiff }
            }
          });
        }

        // Semi-Annual Cascade (if same cycle)
        const getCK = (month: number, year: number, sM: number) => {
          const rel = (month - sM + 12) % 12;
          const isH1 = rel < 6;
          return `${year}-${isH1 ? "H1" : "H2"}`;
        };

        if (getCK(m, y, startMonthConfig) === getCK(nextM, nextY, startMonthConfig)) {
          await tx.leaveBalance.update({
            where: { id: next.id },
            data: { semiAnnualRemaining: current.semiAnnualRemaining }
          });
        }

        m = nextM;
        y = nextY;
      }

      return { success: true };
    }, {
      isolationLevel: "Serializable"
    });

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/employee");
    revalidatePath("/dashboard/manager");
    
    return result;

  } catch (error: any) {
    console.error("Status update error:", error);
    if (error.message.startsWith("BALANCE_NOT_FOUND")) {
      return { error: "One or more leave balance records not found. Please contact admin." };
    }
    return { error: "Failed to update request status. " + error.message };
  }
}