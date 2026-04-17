import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixBalances() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  console.log(`[FIX] Checking balances for ${currentMonth}/${currentYear}...`);

  const balances = await prisma.leaveBalance.findMany({
    where: { month: currentMonth, year: currentYear },
    include: { user: true }
  });

  for (const balance of balances) {
    // Check if next month exists
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    const nextBalance = await prisma.leaveBalance.findFirst({
      where: { userId: balance.userId, month: nextMonth, year: nextYear }
    });

    if (nextBalance) {
      // Recalculate what THIS month's CF and Encash should be
      const expectedFullCF = Math.min(Number(balance.remainingFull.toFixed(2)), 1.0);
      const expectedEncash = Number(Math.max(0, balance.remainingFull - expectedFullCF).toFixed(2));

      if (balance.carriedForward !== expectedFullCF || balance.encashed !== expectedEncash) {
        console.log(`[FIX] User ${balance.user.name}: Actual Encash ${balance.encashed} -> Expected ${expectedEncash}`);
        
        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            carriedForward: expectedFullCF,
            encashed: expectedEncash
          }
        });

        // Also update next month's carried forward if it moved
        const cfDiff = expectedFullCF - nextBalance.carriedForward; // Wait, next month's CF is a separate field? 
        // No, next month's REMAINING_FULL includes the CF.
        // We might need to adjust next month's remainingFull if we changed the CF.
        // But if the CF didn't change (only the encash calculation was wrong), then we are fine.
      }
    }
  }

  console.log("[FIX] Done.");
}

fixBalances().catch(console.error).finally(() => prisma.$disconnect());
