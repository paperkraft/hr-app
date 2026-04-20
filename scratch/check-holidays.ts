import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const holidays = await prisma.publicHoliday.findMany();
  console.log(JSON.stringify(holidays, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
