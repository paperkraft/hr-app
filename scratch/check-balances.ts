import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['EMPLOYEE', 'ACCOUNTANT'] },
    },
    include: {
      leaveBalances: {
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      }
    },
    orderBy: { name: 'asc' }
  });

  console.log('Detailed Balance Report:');
  console.log('----------------------------------------------------------------------------------------------------------------------------------------------');
  console.log('Name             | Mo/Yr | RemFull | RemShort | FullTk | ShortTk | Unpaid | CarriedFW | Encashed');
  console.log('----------------------------------------------------------------------------------------------------------------------------------------------');

  for (const user of users) {
    if (user.leaveBalances.length === 0) continue;
    for (const lb of user.leaveBalances) {
      console.log(
        `${(user.name || user.email).padEnd(16)} | ${String(lb.month).padStart(2)}/${lb.year} | ${String(lb.remainingFull).padStart(7)} | ${String(lb.remainingShort).padStart(8)} | ${String(lb.fullTaken).padStart(6)} | ${String(lb.shortTaken).padStart(7)} | ${String(lb.unpaidTaken).padStart(6)} | ${String(lb.carriedForward).padStart(9)} | ${String(lb.encashed).padStart(8)}`
      );
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
