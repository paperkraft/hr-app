import prisma from "@/lib/prisma";

async function debugUser() {
  const users = await prisma.user.findMany({ 
    where: { role: 'EMPLOYEE' },
    include: {
        leaveBalances: {
            orderBy: [{ year: 'asc' }, { month: 'asc' }]
        }
    }
  });

  for (const user of users) {
      console.log(`\nEmployee: ${user.name} (${user.id})`);
      user.leaveBalances.forEach(b => {
          console.log(`  [${b.month}/${b.year}] RemFull: ${b.remainingFull}, CF_From_Prev: ${b.carriedForward}, Encash: ${b.encashed}`);
      });
  }
}

debugUser().catch(console.error).finally(() => prisma.$disconnect());
