import 'dotenv/config';

import bcrypt from 'bcryptjs';

import { Role } from '@prisma/client';

import prisma from '../src/lib/prisma';

async function main() {
  console.log('🗑️ Cleaning up existing data...');
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('🌱 Starting comprehensive database seed...');

  const developerPassword = await bcrypt.hash('dev@123', 10);

  // 1. Create SYSTEM ADMIN (Developer)
  const systemAdmin = await prisma.user.create({
    data: {
      name: 'Developer Account',
      email: 'dev@sigma.com',
      password: developerPassword,
      role: Role.SYSTEM_ADMIN,
    },
  });
  console.log('👉 Developer Login: dev@sigma.com | Password: dev@123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });