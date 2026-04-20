import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
  const requests = await prisma.leaveRequest.findMany({
    where: {
      startDate: {
        gte: new Date(2026, 3, 1), // April 1, 2026
        lte: new Date(2026, 3, 30, 23, 59, 59)
      }
    },
    include: { user: true },
    orderBy: { startDate: 'asc' }
  });

  console.log('April Leave Requests:');
  console.log('--------------------------------------------------------------------------------------------------');
  console.log('User             | Start      | End        | Status   | Type     | Category');
  console.log('--------------------------------------------------------------------------------------------------');
  for (const r of requests) {
    console.log(
      `${(r.user.name || r.user.email).padEnd(16)} | ${r.startDate.toISOString().split('T')[0]} | ${r.endDate.toISOString().split('T')[0]} | ${r.status.padEnd(8)} | ${r.leaveType?.padEnd(8)} | ${r.category}`
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
