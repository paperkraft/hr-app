import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
  const user = await prisma.user.findFirst({ where: { name: 'Vishal Sannake' } });
  if (!user) return;

  const balance = await prisma.leaveBalance.findFirst({
    where: { userId: user.id, month: 4, year: 2026 }
  });

  const requests = await prisma.leaveRequest.findMany({
    where: { userId: user.id, status: 'APPROVED' }
  });

  console.log('Vishal Balance (April):', JSON.stringify(balance, null, 2));
  console.log('Vishal Approved Requests:', JSON.stringify(requests, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
