"use server";

import { revalidatePath } from "next/cache";
import { leaveApplicationSchema } from "@/lib/validations/leave";
import prisma from "@/lib/prisma";
import { getDaysDifference } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


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

/**
 * POLICY CONSTANTS
 * Casual (P1): 24 days/year -> 2.0/month. 1.0 max CF. 1 short leave per month.
 * Medical (P2): 6 days/year -> 3.0/half-year.
 */
const CASUAL_ACCRUAL = 2.0;
const SICK_ACCRUAL_SEMI = 3.0;
const MAX_CARRY_FORWARD = 1.0;

function round(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export async function ensureBalance(userId: string, month: number, year: number, configStartMonth?: number): Promise<any> {
  const existing = await prisma.leaveBalance.findUnique({
    where: { userId_month_year: { userId, month, year } }
  });
  if (existing) return existing;

  let startMonth = configStartMonth;
  if (startMonth === undefined) {
    const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });
    startMonth = config?.semiAnnualCycleStartMonth ?? 4;
  }

  // Find the predecessor
  const lastRecord = await prisma.leaveBalance.findFirst({
    where: {
      userId,
      OR: [
        { year: { lt: year } },
        { AND: [{ year: year }, { month: { lt: month } }] }
      ]
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });

  let carryForwardToNew = 0.0;
  let semiAnnualToNew = SICK_ACCRUAL_SEMI;

  if (lastRecord) {
    const isConsecutive = (lastRecord.year === year && lastRecord.month === month - 1) ||
      (lastRecord.year === year - 1 && lastRecord.month === 12 && month === 1);

    if (isConsecutive) {
      // Roll over Casual leaves with the 1.0 CF limit
      if (lastRecord.carriedForward === 0 && lastRecord.encashed === 0 && lastRecord.remainingFull > 0) {
        const rem = round(lastRecord.remainingFull);
        carryForwardToNew = Math.min(rem, MAX_CARRY_FORWARD);
        const encash = round(rem - carryForwardToNew);

        await prisma.leaveBalance.update({
          where: { id: lastRecord.id },
          data: { carriedForward: carryForwardToNew, encashed: encash }
        });
      } else {
        carryForwardToNew = Number(lastRecord.carriedForward);
      }

      // Roll over Medical pool if still in cycle
      const getCycleString = (m: number, y: number, sM: number) => {
        const rel = (m - sM + 12) % 12;
        const h = rel < 6 ? "H1" : "H2";
        const sy = (m < sM && (sM + 5) % 12 >= m) ? y - 1 : y;
        return `${sy}-${h}`;
      };

      if (getCycleString(month, year, startMonth) === getCycleString(lastRecord.month, lastRecord.year, startMonth)) {
        semiAnnualToNew = Number(lastRecord.semiAnnualRemaining);
      } else {
        semiAnnualToNew = SICK_ACCRUAL_SEMI;
      }
    } else {
      // Fill the timeline gap recursively
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const gapPrev = await ensureBalance(userId, prevMonth, prevYear, startMonth);
      carryForwardToNew = Number(gapPrev.carriedForward);
    }
  }

  try {
    return await prisma.leaveBalance.create({
      data: {
        userId, month, year,
        remainingFull: round(CASUAL_ACCRUAL + carryForwardToNew),
        remainingShort: 1,
        semiAnnualRemaining: semiAnnualToNew,
        carriedForward: 0.0,
        encashed: 0.0,
        fullTaken: 0.0,
        shortTaken: 0,
        semiAnnualTaken: 0.0,
        unpaidTaken: 0.0,
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

    // --- BUSINESS LOGIC: CATEGORY CONVERSION & AUTO-APPROVAL ---
    let effectiveCategory = data.category;
    let isAutoApproved = true; // ALL leaves are now auto-approved by default
    let approvalNote = "Auto-approved by system.";

    const start = new Date(data.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isBackdated = start < today;

    if (data.category === "MONTHLY_POLICY_1") {
      if (data.leaveType === "CASUAL" && isBackdated) {
        // Condition: Backdated casual leave is converted to UNPAID
        effectiveCategory = "UNPAID";
        approvalNote = `Backdated Casual Leave: Auto-converted to UNPAID and approved by system.`;
      } else if (data.leaveType === "MEDICAL" && isBackdated) {
        approvalNote = "Medical Leave: Backdated but approved by system.";
      } else {
        const typeLabel = data?.leaveType?.toLowerCase() || "standard";
        approvalNote = `Monthly ${typeLabel} leave: Auto-approved.`;
      }
    } else if (data.category === "SEMI_ANNUAL_POLICY_2") {
      approvalNote = "Semi-Annual Leave (Policy 2): Auto-approved by system.";
    } else if (data.category === "UNPAID") {
      approvalNote = "Unpaid Leave: Auto-approved by system.";
    }

    const newRequest = await prisma.leaveRequest.create({
      data: {
        userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        duration: data.duration,
        category: effectiveCategory as any,
        leaveType: data.leaveType as any,
        reason: data.reason,
        startTime: data.startTime,
        endTime: data.endTime,
        halfDayType: data.halfDayType,
        managerNote: approvalNote,
        // systemNote: approvalNote, // Saving note for visibility
      }
    });

    if (isAutoApproved) {
      await processLeaveRequestStatus(newRequest.id, "APPROVED", approvalNote);
    }

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

    return await processLeaveRequestStatus(requestId, status, note);

  } catch (error: any) {
    console.error("Status update error:", error);
    if (error.message.startsWith("BALANCE_NOT_FOUND")) {
      return { error: "One or more leave balance records not found. Please contact admin." };
    }
    return { error: "Failed to update request status. " + error.message };
  }
}

/**
 * Internal helper to perform the actual database changes for approval/rejection.
 * Does NOT check permissions.
 */
async function processLeaveRequestStatus(requestId: string, status: "APPROVED" | "REJECTED", note?: string) {
  const requestMeta = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { user: { select: { id: true } } }
  });

  if (!requestMeta) throw new Error("Request not found.");
  if (requestMeta.status !== "PENDING") return { success: true };

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
      let takenField: "fullTaken" | "shortTaken" | "semiAnnualTaken" | "unpaidTaken" | null = null;

      if (txRequest.category === "MONTHLY_POLICY_1") {
        if (txRequest.duration === "FULL") {
          requestedNeeded = part.days;
          balanceField = "remainingFull";
          takenField = "fullTaken";
        } else if (txRequest.duration === "HALF") {
          requestedNeeded = 0.5 * part.days;
          balanceField = "remainingFull";
          takenField = "fullTaken";
        } else if (txRequest.duration === "SHORT") {
          requestedNeeded = 1;
          balanceField = "remainingShort";
          takenField = "shortTaken";
        }
      } else if (txRequest.category === "SEMI_ANNUAL_POLICY_2") {
        requestedNeeded = part.days;
        balanceField = "semiAnnualRemaining";
        takenField = "semiAnnualTaken";
      } else if (txRequest.category === "UNPAID") {
        requestedNeeded = txRequest.duration === "HALF" ? 0.5 * part.days : part.days;
        takenField = "unpaidTaken";
      }

      if (balanceField && takenField) {
        const available = Number(balance[balanceField]);
        const deductAmount = Math.min(available, requestedNeeded);
        const overflow = requestedNeeded - deductAmount;
        totalOverflowLwp += overflow;

        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: {
            [balanceField]: { decrement: deductAmount },
            [takenField]: { increment: deductAmount },
            unpaidTaken: { increment: overflow }
          }
        });
      } else if (takenField === "unpaidTaken") {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { unpaidTaken: { increment: requestedNeeded } }
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

      const newCFFromCurrent = Math.min(Number(current.remainingFull.toFixed(2)), 1.0);
      const oldCFInNext = Number(next.carriedForward);
      const cfDiff = Number((newCFFromCurrent - oldCFInNext).toFixed(2));
      const currentEncashed = Number(Math.max(0, current.remainingFull - newCFFromCurrent).toFixed(2));

      if (current.carriedForward !== newCFFromCurrent || current.encashed !== currentEncashed) {
        await tx.leaveBalance.update({
          where: { id: current.id },
          data: {
            carriedForward: newCFFromCurrent,
            encashed: currentEncashed
          }
        });
      }

      if (cfDiff !== 0) {
        await tx.leaveBalance.update({
          where: { id: next.id },
          data: {
            remainingFull: { increment: cfDiff }
          }
        });
      }

      if (getCycleKey(m, y, startMonthConfig) === getCycleKey(nextM, nextY, startMonthConfig)) {
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
}

export async function cancelApprovedLeave(requestId: string, note?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Login required." };

  const { role } = session.user as any;
  const isAdminOrAccountant = ["ADMIN", "SYSTEM_ADMIN", "ACCOUNTANT"].includes(role);

  if (!isAdminOrAccountant) {
    return { error: "Unauthorized. Only Accountants or Admins can cancel approved leaves." };
  }

  try {
    const request = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!request) return { error: "Request not found." };
    if (request.status !== "APPROVED") return { error: "Only approved requests can be cancelled." };

    const result = await prisma.$transaction(async (tx) => {
      const monthParts = splitLeaveIntoMonths(request.startDate, request.endDate);

      for (const part of monthParts) {
        const balance = await tx.leaveBalance.findUnique({
          where: { userId_month_year: { userId: request.userId, month: part.month, year: part.year } }
        });

        if (!balance) continue;

        let amountToRevert = 0;
        let balanceField: "remainingFull" | "remainingShort" | "semiAnnualRemaining" | null = null;
        let takenField: "fullTaken" | "shortTaken" | "semiAnnualTaken" | "unpaidTaken" | null = null;

        if (request.category === "MONTHLY_POLICY_1") {
          if (request.duration === "FULL") {
            amountToRevert = part.days;
            balanceField = "remainingFull";
            takenField = "fullTaken";
          } else if (request.duration === "HALF") {
            amountToRevert = 0.5 * part.days;
            balanceField = "remainingFull";
            takenField = "fullTaken";
          } else if (request.duration === "SHORT") {
            amountToRevert = 1;
            balanceField = "remainingShort";
            takenField = "shortTaken";
          }
        } else if (request.category === "SEMI_ANNUAL_POLICY_2") {
          amountToRevert = part.days;
          balanceField = "semiAnnualRemaining";
          takenField = "semiAnnualTaken";
        } else if (request.category === "UNPAID") {
          amountToRevert = request.duration === "HALF" ? 0.5 * part.days : part.days;
          takenField = "unpaidTaken";
        }

        if (balanceField && takenField) {
          let overflowRevert = 0;
          if (request.managerNote?.includes("[Auto-LWP:")) {
            const match = request.managerNote.match(/\[Auto-LWP: ([\d.]+)\]/);
            if (match) overflowRevert = parseFloat(match[1]);
          }

          const deductedFromBalance = amountToRevert - overflowRevert;

          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              [balanceField]: { increment: deductedFromBalance },
              [takenField]: { decrement: deductedFromBalance },
              unpaidTaken: { decrement: overflowRevert }
            }
          });
        } else if (takenField === "unpaidTaken") {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: { unpaidTaken: { decrement: amountToRevert } }
          });
        }
      }

      await tx.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          managerNote: `CANCELLED: ${note || "Cancelled by administrator."}`
        }
      });

      const config = await tx.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });
      const startMonthConfig = (config as any)?.semiAnnualCycleStartMonth ?? 4;

      // Final Step: Cascade updates throughout the rest of the year
      let m = monthParts[0].month;
      let y = monthParts[0].year;

      while (true) {
        const current = await tx.leaveBalance.findUnique({
          where: { userId_month_year: { userId: request.userId, month: m, year: y } }
        });
        if (!current) break;

        let nextM = m + 1;
        let nextY = y;
        if (nextM > 12) {
          nextM = 1;
          nextY++;
        }

        const next = await tx.leaveBalance.findUnique({
          where: { userId_month_year: { userId: request.userId, month: nextM, year: nextY } }
        });
        if (!next) break;

        // 1. Recalculate split for CURRENT
        const rem = round(current.remainingFull);
        const expectedCF = Math.min(rem, MAX_CARRY_FORWARD);
        const expectedEncash = round(rem - expectedCF);

        if (current.carriedForward !== expectedCF || current.encashed !== expectedEncash) {
          await tx.leaveBalance.update({
            where: { id: current.id },
            data: { carriedForward: expectedCF, encashed: expectedEncash }
          });
        }

        // 2. Adjust NEXT's starting balance based on the NEW CF
        // Rule: Start_of_Next = ACCRUAL (1.0) + CF_From_Current
        // Since 'remainingFull' also includes 'used' leaves in that month, we adjust it relatively
        const cfDiff = round(expectedCF - next.carriedForward);

        if (cfDiff !== 0) {
          await tx.leaveBalance.update({
            where: { id: next.id },
            data: {
              remainingFull: { increment: cfDiff },
              carriedForward: expectedCF
            }
          });
        }

        // 3. Sync Semi-Annual Sick pool if still in the same cycle
        const isSameCycle = getCycleKey(m, y, startMonthConfig) === getCycleKey(nextM, nextY, startMonthConfig);
        if (isSameCycle && next.semiAnnualRemaining !== current.semiAnnualRemaining) {
          await tx.leaveBalance.update({
            where: { id: next.id },
            data: { semiAnnualRemaining: current.semiAnnualRemaining }
          });
        }

        m = nextM;
        y = nextY;
        if (y > monthParts[0].year + 1) break; // Limit cascade to 1 year
      }

      return { success: true };
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/accountant");
    revalidatePath("/dashboard/employee/leaves");
    return result;

  } catch (error: any) {
    console.error("Cancellation error:", error);
    return { error: "Failed to cancel leave: " + error.message };
  }
}

// Helper needed by processLeaveRequestStatus (duplicated/moved here for scope)
function getCycleKey(month: number, year: number, sM: number) {
  const rel = (month - sM + 12) % 12;
  const isH1 = rel < 6;
  return `${year}-${isH1 ? "H1" : "H2"}`;
}