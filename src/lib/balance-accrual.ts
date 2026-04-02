import prisma from "@/lib/prisma";
import { ensureBalance } from "@/actions/leave";

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
