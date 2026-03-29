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
      name: 'Michael Scott',
      email: 'admin@sigma.com',
      password: defaultPassword,
      role: Role.ADMIN,
      leaveBalances: {
        create: { month: currentMonth, year: currentYear, remainingFull: 2.0, remainingShort: 1, semiAnnualRemaining: 3 }
      }
    },
  });

  // 2. Create MANAGERS
  const manager1 = await prisma.user.create({
    data: {
      name: 'Jim Halpert',
      email: 'manager1@sigma.com',
      password: defaultPassword,
      role: Role.MANAGER,
      managerId: admin.id,
      leaveBalances: {
        create: { month: currentMonth, year: currentYear, remainingFull: 1.5, remainingShort: 0, semiAnnualRemaining: 3 }
      }
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      name: 'Dwight Schrute',
      email: 'manager2@sigma.com',
      password: defaultPassword,
      role: Role.MANAGER,
      managerId: admin.id,
      leaveBalances: {
        create: { month: currentMonth, year: currentYear, remainingFull: 2.0, remainingShort: 1, semiAnnualRemaining: 3 }
      }
    },
  });

  // 3. Create ACCOUNTANT
  const accountant = await prisma.user.create({
    data: {
      name: 'Angela Martin',
      email: 'accountant@sigma.com',
      password: defaultPassword,
      role: Role.ACCOUNTANT,
      managerId: admin.id,
      leaveBalances: {
        create: { month: currentMonth, year: currentYear, remainingFull: 1.0, remainingShort: 1, semiAnnualRemaining: 2 }
      }
    },
  });

  // 4. Create EMPLOYEES
  const employeesData = [
    { name: 'Pam Beesly', email: 'pam@sigma.com', mgr: manager1.id },
    { name: 'Stanley Hudson', email: 'stanley@sigma.com', mgr: manager1.id },
    { name: 'Kevin Malone', email: 'kevin@sigma.com', mgr: manager2.id },
    { name: 'Oscar Martinez', email: 'oscar@sigma.com', mgr: manager2.id },
    { name: 'Kelly Kapoor', email: 'kelly@sigma.com', mgr: manager2.id },
  ];

  const employees = [];
  for (const emp of employeesData) {
    const created = await prisma.user.create({
      data: {
        name: emp.name,
        email: emp.email,
        password: defaultPassword,
        role: Role.EMPLOYEE,
        managerId: emp.mgr,
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
    employees.push(created);
    console.log(`✅ Created Employee: ${created.name}`);
  }

  // 5. Create ATTENDANCE (Last 7 days for everyone)
  console.log('🕒 Generating attendance records...');
  for (const user of [admin, manager1, manager2, accountant, ...employees]) {
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
  
  // Pending Employee Request for Manager 1
  await prisma.leaveRequest.create({
    data: {
      userId: employees[0].id, // Pam
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
      userId: manager1.id, // Jim
      startDate: new Date(),
      endDate: new Date(),
      duration: LeaveDuration.HALF,
      category: LeaveCategory.MONTHLY_POLICY_1,
      status: LeaveStatus.APPROVED,
      reason: "Personal appointment."
    }
  });

  // Pending Manager Request for Admin
  await prisma.leaveRequest.create({
    data: {
      userId: manager2.id, // Dwight
      startDate: new Date(now.getTime() + 86400000 * 2), // 2 days from now
      endDate: new Date(now.getTime() + 86400000 * 2),
      duration: LeaveDuration.FULL,
      category: LeaveCategory.SEMI_ANNUAL_POLICY_2,
      status: LeaveStatus.PENDING,
      reason: "Going to a beet convention."
    }
  });

  console.log('🎉 Seeding finished successfully! All roles have been initialized with realistic data.');
  console.log('👉 Login: admin@sigma.com | manager1@sigma.com | accountant@sigma.com | employee@sigma.com');
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