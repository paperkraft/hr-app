
import { PrismaClient } from '@prisma/client';
import pkg from 'pg';
const { Pool } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const attendances = await prisma.attendance.findMany({
    orderBy: { punchIn: 'desc' },
    include: { user: { select: { name: true, email: true } } }
  });

  console.log('\n--- ALL Database Attendance Records ---');
  if (attendances.length === 0) console.log('No records found.');
  attendances.forEach(a => {
    console.log(`User: ${a.user.name || a.user.email}`);
    console.log(`  Attendance Date: ${a.date.toISOString().split('T')[0]}`);
    console.log(`  Punch In:  ${a.punchIn.toISOString()} (${a.punchIn.toLocaleString()})`);
    console.log(`  Punch Out: ${a.punchOut ? a.punchOut.toISOString() + ' (' + a.punchOut.toLocaleString() + ')' : 'N/A'}`);
    console.log('---');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
