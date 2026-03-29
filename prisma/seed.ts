import 'dotenv/config';
import { Role, LeaveStatus, LeaveDuration, LeaveCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

async function main() {
  console.log('🗑️ Cleaning up existing data...');
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Starting comprehensive database seed...');

  const defaultPassword = await bcrypt.hash('password123', 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // 1. Create ADMIN
  const admin = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma',
      email: 'admin@sigma.com',
      password: defaultPassword,
      role: Role.ADMIN,
      leaveBalances: {
        create: { month: currentMonth, year: currentYear, remainingFull: 2.0, remainingShort: 1, semiAnnualRemaining: 3 }
      }
    },
  });
  console.log(`✅ Created Admin: ${admin.name}`);

  // 2. Create MANAGER (Reports to Admin)
  const manager = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'manager@sigma.com',
      password: defaultPassword,
      role: Role.MANAGER,
      managerId: admin.id,
      leaveBalances: {
        create: { month: currentMonth, year: currentYear, remainingFull: 1.5, remainingShort: 0, semiAnnualRemaining: 3 }
      }
    },
  });
  console.log(`✅ Created Manager: ${manager.name}`);

  // 3. Create ACCOUNTANT (Reports to Admin)
  const accountant = await prisma.user.create({
    data: {
      name: 'Amit Kumar',
      email: 'accountant@sigma.com',
      password: defaultPassword,
      role: Role.ACCOUNTANT,
      managerId: admin.id,
      leaveBalances: {
        create: { month: currentMonth, year: currentYear, remainingFull: 1.0, remainingShort: 1, semiAnnualRemaining: 2 }
      }
    },
  });
  console.log(`✅ Created Accountant: ${accountant.name}`);

  // 4. Create EMPLOYEE (Reports to Manager)
  const employee = await prisma.user.create({
    data: {
      name: 'Sneha Desai',
      email: 'employee@sigma.com',
      password: defaultPassword,
      role: Role.EMPLOYEE,
      managerId: manager.id,
      leaveBalances: {
        createMany: {
          data: [
            { month: currentMonth, year: currentYear, remainingFull: 2.0, remainingShort: 1, semiAnnualRemaining: 3 },
            { month: currentMonth + 1 > 12 ? 1 : currentMonth + 1, year: currentMonth + 1 > 12 ? currentYear + 1 : currentYear, remainingFull: 2.0, remainingShort: 1, semiAnnualRemaining: 3 }
          ]
        }
      }
    }
  });
  console.log(`✅ Created Employee: ${employee.name}`);

  // 5. Create ATTENDANCE (Last 7 days for everyone)
  console.log('🕒 Generating attendance records...');
  for (const user of [admin, manager, accountant, employee]) {
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends

        const punchIn = new Date(date);
        punchIn.setHours(9, Math.floor(Math.random() * 20), 0); // Randomness between 9:00 and 9:20

        const punchOut = new Date(date);
        punchOut.setHours(18, Math.floor(Math.random() * 20), 0);

        await prisma.attendance.create({
            data: {
                userId: user.id,
                date: date,
                punchIn: punchIn,
                punchOut: punchOut,
                isLate: punchIn.getMinutes() > 10 // Late if after 9:10
            }
        });
    }
  }

  // 6. Create LEAVE REQUESTS
  console.log('📝 Generating leave requests...');
  
  // Pending Employee Request for Manager
  await prisma.leaveRequest.create({
    data: {
      userId: employee.id, // Sneha
      startDate: new Date(),
      endDate: new Date(),
      duration: LeaveDuration.FULL,
      category: LeaveCategory.MONTHLY_POLICY_1,
      status: LeaveStatus.PENDING,
      reason: "Family emergency, need a full day off."
    }
  });

  // Approved Request (already deducted manually in seed balance for demo)
  await prisma.leaveRequest.create({
    data: {
      userId: manager.id, // Priya
      startDate: new Date(),
      endDate: new Date(),
      duration: LeaveDuration.HALF,
      category: LeaveCategory.MONTHLY_POLICY_1,
      status: LeaveStatus.APPROVED,
      reason: "Personal appointment at the bank."
    }
  });

  // Pending Accountant Request for Admin
  await prisma.leaveRequest.create({
    data: {
      userId: accountant.id, // Amit
      startDate: new Date(now.getTime() + 86400000 * 2), // 2 days from now
      endDate: new Date(now.getTime() + 86400000 * 2),
      duration: LeaveDuration.FULL,
      category: LeaveCategory.SEMI_ANNUAL_POLICY_2,
      status: LeaveStatus.PENDING,
      reason: "Attending a family wedding out of town."
    }
  });

  console.log('🎉 Seeding finished successfully! All roles have been initialized with realistic data.');
  console.log('👉 Login: admin@sigma.com | manager@sigma.com | accountant@sigma.com | employee@sigma.com');
  console.log('👉 Password: password123');
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