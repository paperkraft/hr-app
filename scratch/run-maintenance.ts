import 'dotenv/config';
import { generateAllMonthlyBalances, syncAllBalances } from '../src/lib/balance-accrual';
import prisma from '../src/lib/prisma';

async function main() {
  console.log('Running Maintenance...');
  const accrualCount = await generateAllMonthlyBalances();
  console.log(`${accrualCount} users processed for monthly balances.`);
  
  const syncCount = await syncAllBalances();
  console.log(`${syncCount} balance synchronizations performed.`);
  
  console.log('Maintenance Complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
