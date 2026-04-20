import prisma from "@/lib/prisma";
import { ensureBalance } from "@/actions/leave";

/**
 * Deep synchronization of all leave balances.
 * This function iterates through every user's historical records and re-calculates 
 * their carry-forward and encashment distributions based on current policy rules.
 */
export async function syncAllBalances() {
  const users = await prisma.user.findMany({ 
    select: { id: true, name: true } 
  });
  
  let fixCount = 0;

  for (const user of users) {
     // Fetch all balances for this user chronologically
     const userBalances = await prisma.leaveBalance.findMany({
         where: { userId: user.id },
         orderBy: [{ year: 'asc' }, { month: 'asc' }]
     });

     // We compare each month (current) with its chronological successor (next)
     for (let i = 0; i < userBalances.length - 1; i++) {
         const current = userBalances[i];
         const next = userBalances[i+1];

         const expectedNextMonth = current.month === 12 ? 1 : current.month + 1;
         const expectedNextYear = current.month === 12 ? current.year + 1 : current.year;

         // Check if they are actually consecutive months
         if (next.month === expectedNextMonth && next.year === expectedNextYear) {
             const expectedCF = Math.min(Number(current.remainingFull.toFixed(2)), 1.0);
             const expectedEncash = Number(Math.max(0, current.remainingFull - expectedCF).toFixed(2));

             // Precision-safe comparison (0.01 tolerance)
             const hasCfDiff = Math.abs(current.carriedForward - expectedCF) > 0.01;
             const hasEncashDiff = Math.abs(current.encashed - expectedEncash) > 0.01;

             if (hasCfDiff || hasEncashDiff) {
                 console.log(`[SYNC] Correcting ${user.name} (${current.month}/${current.year}): Encash ${current.encashed}->${expectedEncash}`);
                 
                 await prisma.leaveBalance.update({
                     where: { id: current.id },
                     data: { 
                        carriedForward: expectedCF, 
                        encashed: expectedEncash 
                     }
                 });

                 // If the CF value changed, we MUST adjust the 'remainingFull' of the next month
                 // because the next month was initialized as (CASUAL_ACCRUAL + OLD_CF)
                 // where CASUAL_ACCRUAL is currently 2.0
                 if (hasCfDiff) {
                    const cfDiff = expectedCF - current.carriedForward;
                    const nextBalance = await prisma.leaveBalance.findUnique({ where: { id: next.id } });
                    if (nextBalance) {
                        const newTotal = Math.min(3.0, Number((nextBalance.remainingFull + cfDiff).toFixed(2)));
                        await prisma.leaveBalance.update({
                            where: { id: next.id },
                            data: {
                                remainingFull: newTotal,
                                carriedForward: expectedCF
                            }
                        });
                    }
                }

                 fixCount++;
             }
         }
     }
  }
  return fixCount;
}

/**
 * Proactively ensures that all active staff members have a LeaveBalance record
 */
export async function generateAllMonthlyBalances() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Also check for NEXT month if we are in the latter half of the month
  const checkNext = now.getDate() >= 15;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  const users = await prisma.user.findMany({
    where: {
      role: { in: ["EMPLOYEE", "ACCOUNTANT", "ADMIN", "SYSTEM_ADMIN"] }
    },
    select: { id: true }
  });

  const config = await prisma.systemConfig.findUnique({ 
    where: { id: "GLOBAL_CONFIG" } 
  });
  const startMonth = (config as any)?.semiAnnualCycleStartMonth ?? 4;

  let processedCount = 0;
  for (const user of users) {
    try {
      // Ensure current month exists
      await ensureBalance(user.id, currentMonth, currentYear, startMonth);
      
      // Proactively ensure next month exists if near the transition
      if (checkNext) {
        await ensureBalance(user.id, nextMonth, nextYear, startMonth);
      }
      
      processedCount++;
    } catch (error) {
      console.error(`Failed to ensure balance for user ${user.id}:`, error);
    }
  }

  return processedCount;
}
