import prisma from "@/lib/prisma";
import { ensureBalance } from "@/actions/leave";

export async function syncAllBalances() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const balances = await prisma.leaveBalance.findMany({
    where: { month: currentMonth, year: currentYear },
    include: { user: true }
  });

  let fixCount = 0;

  for (const b of balances) {
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    const next = await prisma.leaveBalance.findFirst({
        where: { userId: b.userId, month: nextMonth, year: nextYear }
    });

    if (next) {
        const expectedCF = Math.min(Number(b.remainingFull.toFixed(2)), 1.0);
        const expectedEncash = Number(Math.max(0, b.remainingFull - expectedCF).toFixed(2));

        if (Math.abs(b.carriedForward - expectedCF) > 0.01 || Math.abs(b.encashed - expectedEncash) > 0.01) {
            await prisma.leaveBalance.update({
                where: { id: b.id },
                data: { carriedForward: expectedCF, encashed: expectedEncash }
            });
            fixCount++;
        }
    }
  }
  return fixCount;
}

/**
 * Proactively ensures that all active staff members have a LeaveBalance record
 * for the current month. This handles carry-forward and encashment logic
 * automatically at the start of the month.
 */
export async function generateAllMonthlyBalances() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Fetch all staff members across the system
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

  // Process each user sequentially to ensure transitive balance creation (ensureBalance is recursive)
  for (const user of users) {
    try {
      await ensureBalance(user.id, currentMonth, currentYear, startMonth);
      processedCount++;
    } catch (error) {
      console.error(`Failed to ensure balance for user ${user.id}:`, error);
    }
  }

  return processedCount;
}
