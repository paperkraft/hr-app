import prisma from "@/lib/prisma";

async function forceSync() {
  console.log("--- FORCE SYNC START ---");
  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  
  for (const user of users) {
    const balances = await prisma.leaveBalance.findMany({
      where: { userId: user.id },
      orderBy: [{ year: 'asc' }, { month: 'asc' }]
    });

    for (let i = 0; i < balances.length - 1; i++) {
        const curr = balances[i];
        const next = balances[i+1];

        // Recalculate what Carry Forward SHOULD be from curr
        const rem = Number(curr.remainingFull.toFixed(2));
        const expectedCF = Math.min(rem, 1.0);
        const expectedEncash = Number((rem - expectedCF).toFixed(2));

        console.log(`User ${user.name} [${curr.month}/${curr.year}]: Rem=${rem}, Existing_CF=${curr.carriedForward}, Existing_Encash=${curr.encashed}`);
        console.log(`  -> Expected CF=${expectedCF}, Expected Encash=${expectedEncash}`);

        if (Math.abs(curr.carriedForward - expectedCF) > 0.01 || Math.abs(curr.encashed - expectedEncash) > 0.01) {
            console.log(`  [FIX] Updating ${curr.month}/${curr.year} for ${user.name}`);
            await prisma.leaveBalance.update({
                where: { id: curr.id },
                data: { carriedForward: expectedCF, encashed: expectedEncash }
            });

            // Adjust successor's remainingFull
            const cfDiff = expectedCF - curr.carriedForward;
            if (Math.abs(cfDiff) > 0.01) {
                console.log(`  [FIX] Adjusting ${next.month}/${next.year} starting balance by ${cfDiff}`);
                await prisma.leaveBalance.update({
                    where: { id: next.id },
                    data: { remainingFull: { increment: cfDiff } }
                });
            }
        }
    }
  }
  console.log("--- FORCE SYNC END ---");
}

forceSync().catch(console.error).finally(() => prisma.$disconnect());
