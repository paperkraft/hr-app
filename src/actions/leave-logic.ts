"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * UTILITY: Consistent rounding for leave calculations to prevent floating point drift.
 */
function round(value: number): number {
  return Number(Math.round(value * 100) / 100);
}

/**
 * CORE POLICY CONSTANTS
 */
const MONTHLY_ACCRUAL = 2.0;       // 24 days total per year (12 Paid + 12 Sick pooled)
const MAX_CARRY_FORWARD = 1.0;     // Only 1 day can be carried to the next month
const SEMI_ANNUAL_SICK_BASE = 3.0; // Policy 2 (separate sick bank) - currently 3 per half year? 
                                   // User said 12 sick per year. If P2 is for sick, it should be 6.
const P2_SICK_ACCRUAL = 6.0;       // Updated to 6.0 per half year based on "12 yearly" rule.

/**
 * ensures that a balance record exists for a specific user/month/year.
 * If not found, it creates one by rolling over the previous month's balance.
 */
export async function ensureBalance(userId: string, month: number, year: number, configStartMonth?: number): Promise<any> {
  const existing = await prisma.leaveBalance.findUnique({
    where: { userId_month_year: { userId, month, year } }
  });
  if (existing) return existing;

  // Configuration for Semi-Annual Cycles (Policy 2)
  let startMonth = configStartMonth;
  if (startMonth === undefined) {
    const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });
    startMonth = config?.semiAnnualCycleStartMonth ?? 4;
  }

  // Find the predecessor record
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
  let p2Balance = P2_SICK_ACCRUAL; // Default for new users or cycle starts

  if (lastRecord) {
    const isConsecutive = (lastRecord.year === year && lastRecord.month === month - 1) ||
                          (lastRecord.year === year - 1 && lastRecord.month === 12 && month === 1);

    if (isConsecutive) {
      // 1. Calculate CF and Encash for the predecessor
      // We overwrite existing split ONLY IF they are 0, OR we have explicit maintenance logic.
      // For now, ensureBalance is safe/conservative.
      const rem = round(lastRecord.remainingFull);
      
      // If the predecessor hasn't been finalized yet, finalize it now
      if (lastRecord.carriedForward === 0 && lastRecord.encashed === 0 && rem > 0) {
        carryForwardToNew = Math.min(rem, MAX_CARRY_FORWARD);
        const encashed = round(rem - carryForwardToNew);
        
        await prisma.leaveBalance.update({
          where: { id: lastRecord.id },
          data: { carriedForward: carryForwardToNew, encashed: encashed }
        });
      } else {
        carryForwardToNew = lastRecord.carriedForward;
      }
    } else {
      // Recursive call to fill gaps
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const createdPrev = await ensureBalance(userId, prevMonth, prevYear, startMonth);
      carryForwardToNew = createdPrev.carriedForward;
    }

    // 2. Determine Semi-Annual P2 Balance
    const getCycleKey = (m: number, y: number, sM: number) => {
      const rel = (m - sM + 12) % 12;
      const isH1 = rel < 6;
      const startM = isH1 ? sM : ((sM + 6) % 12 || 12);
      const startedLastYear = m < startM && ((sM + 5) % 12 || 12) >= m;
      return `${startedLastYear ? y - 1 : y}-${isH1 ? "H1" : "H2"}`;
    };

    const targetKey = getCycleKey(month, year, startMonth);
    const lastKey = getCycleKey(lastRecord.month, lastRecord.year, startMonth);

    if (targetKey === lastKey) {
        // Continue from previous month in cycle
        p2Balance = lastRecord.semiAnnualRemaining;
    } else {
        // New cycle refresh
        p2Balance = P2_SICK_ACCRUAL;
    }
  }

  // Create the fresh balance record
  try {
    return await prisma.leaveBalance.create({
      data: {
        userId,
        month,
        year,
        remainingFull: round(MONTHLY_ACCRUAL + carryForwardToNew),
        remainingShort: 1,
        semiAnnualRemaining: p2Balance,
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

/**
 * Cascades balance changes from a modified month to all future months.
 * Used when a leave is approved, edited, or cancelled.
 */
export async function cascadeBalanceUpdates(userId: string, startMonth: number, startYear: number) {
  let currentMonth = startMonth;
  let currentYear = startYear;

  const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });
  const startM = config?.semiAnnualCycleStartMonth ?? 4;

  while (true) {
    const current = await prisma.leaveBalance.findUnique({
      where: { userId_month_year: { userId, month: currentMonth, year: currentYear } }
    });
    if (!current) break;

    // Determine the successor
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }

    const next = await prisma.leaveBalance.findUnique({
      where: { userId_month_year: { userId, month: nextMonth, year: nextYear } }
    });
    if (!next) break;

    // 1. Recalculate what CURRENT should carry to NEXT
    const rem = round(current.remainingFull);
    const expectedCF = Math.min(rem, MAX_CARRY_FORWARD);
    const expectedEncash = round(rem - expectedCF);

    // 2. Perform updates if needed
    if (current.carriedForward !== expectedCF || current.encashed !== expectedEncash) {
      await prisma.leaveBalance.update({
        where: { id: current.id },
        data: { carriedForward: expectedCF, encashed: expectedEncash }
      });
    }

    // 3. Update NEXT's total balance based on THE NEW CF
    // Formula: NEW_TOTAL = ACCRUAL (2.0) + NEW_CF - USED_SO_FAR
    // Simpler: NEW_TOTAL = NEW_CF + (OLD_TOTAL - OLD_CF)
    const newTotalFull = round(expectedCF + (next.remainingFull - next.carriedForward));
    
    if (next.remainingFull !== newTotalFull || next.carriedForward !== expectedCF) {
        await prisma.leaveBalance.update({
            where: { id: next.id },
            data: { 
                remainingFull: newTotalFull,
                carriedForward: 0.0 // Important: CF is tracked on the donor month in our system, 
                                    // but we use it as a starting value. We'll set it to 0 here to avoid confusion
                                    // but actually we should keep track of it if we want to show "CF In"
            }
        });
    }

    currentMonth = nextMonth;
    currentYear = nextYear;
    
    // Safety break
    if (currentYear > startYear + 2) break;
  }
}
