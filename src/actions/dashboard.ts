"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTodayRange } from "@/lib/attendance-helper"
import { ensureBalance } from "./leave"
import { processAutoPunchOuts } from "@/lib/auto-punch-out"
import { getUpcomingHolidays } from "./holiday"
import { getAnnouncements } from "./announcement"
import { getNotifications } from "./notification"

// --- Helper for Duration ---
function getDaysDifference(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
}

// --- Admin Dashboard Stats ---
export async function getAdminDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const totalEmployees = await prisma.user.count({ where: { role: { not: 'SYSTEM_ADMIN' } } });

  const allPendingRequests = await prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  const { start: today, end: tomorrow } = getTodayRange();

  const staff = await prisma.user.findMany({
    where: { role: { in: ["EMPLOYEE", "ACCOUNTANT"] } },
    include: {
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { gte: startOfMonth, lte: endOfMonth }
        }
      }
    }
  });

  const todayAttendance = await prisma.attendance.findMany({
    where: { date: { gte: today, lte: tomorrow } }
  });

  const todayLeaves = await prisma.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: today },
      endDate: { gte: today }
    },
    include: { user: true }
  });

  const presentIds = new Set(todayAttendance.map(a => a.userId));
  const onLeaveIds = new Set(todayLeaves.map(l => l.userId));

  const presentEmployees = staff.filter(s => presentIds.has(s.id));
  const onLeaveEmployees = staff.filter(s => onLeaveIds.has(s.id) && !presentIds.has(s.id));
  const absentEmployees = staff.filter(s => !presentIds.has(s.id) && !onLeaveIds.has(s.id));

  const attendanceRate = staff.length > 0 ? Math.round((presentEmployees.length / staff.length) * 100) : 100;

  const recentApprovals = await prisma.leaveRequest.findMany({
    where: { status: "APPROVED" },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 15
  });

  const monthlyLeaveSummary = staff.map(s => {
    let totalDays = 0;
    s.leaveRequests.forEach(req => {
      const diff = getDaysDifference(req.startDate, req.endDate);
      totalDays += req.duration === "HALF" ? diff * 0.5 : diff;
    });
    return { id: s.id, name: s.name || s.email, totalDays };
  }).sort((a, b) => b.totalDays - a.totalDays);

  return {
    success: true,
    data: {
      totalEmployees,
      pendingCount: allPendingRequests.length,
      attendanceRate,
      presentEmployees: presentEmployees.map(e => ({ id: e.id, name: e.name || e.email })),
      absentEmployees: absentEmployees.map(e => ({ id: e.id, name: e.name || e.email })),
      onLeaveEmployees: onLeaveEmployees.map(e => ({ id: e.id, name: e.name || e.email })),
      monthlyLeaveSummary,
      holidays: (await getUpcomingHolidays(5)).data || [],
      announcements: (await getAnnouncements()).data || [],
      notifications: (await getNotifications()).data || [],
      allPendingRequests: allPendingRequests.map((req: any) => ({
        id: req.id,
        employeeName: req.user.name || req.user.email,
        role: req.user.role,
        startDate: new Date(req.startDate).toISOString().split('T')[0],
        endDate: new Date(req.endDate).toISOString().split('T')[0],
        duration: req.duration,
        halfDayType: req.halfDayType,
        category: req.category,
        reason: req.reason || "No reason provided",
      })),
      recentApprovals: recentApprovals.map((req: any) => ({
        id: req.id,
        employeeName: req.user.name || req.user.email,
        role: req.user.role,
        startDate: new Date(req.startDate).toISOString().split('T')[0],
        endDate: new Date(req.endDate).toISOString().split('T')[0],
        category: req.category,
        duration: req.duration,
        halfDayType: req.halfDayType,
        systemNote: req.systemNote,
        updatedAt: req.updatedAt
      })),
    }
  };
}

// --- Employee Dashboard Stats ---
export async function getEmployeeDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  await processAutoPunchOuts(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { department: true, leaveBalances: true }
  });

  if (!user) return { success: false, error: "User profile not found." };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const balances = (await ensureBalance(session.user.id, currentMonth, currentYear).catch(() => null)) || {
    remainingFull: 0,
    semiAnnualRemaining: 0,
    casualTaken: 0,
    medicalTaken: 0,
    semiAnnualTaken: 0,
    unpaidTaken: 0
  };

  const { start, end } = getTodayRange();
  const todaysLog = await prisma.attendance.findFirst({
    where: { userId: session.user.id, date: { gte: start, lte: end } }
  });

  let sessionStatus: "PENDING" | "PUNCHED_IN" | "PUNCHED_OUT" = "PENDING";
  if (todaysLog) {
    sessionStatus = todaysLog.punchOut ? "PUNCHED_OUT" : "PUNCHED_IN";
  }

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  const approvedThisYear = leaveRequests.filter(
    (r) => r.status === "APPROVED" && new Date(r.startDate).getFullYear() === currentYear
  );

  const casualTaken = approvedThisYear
    .filter((r) => r.category === "MONTHLY_POLICY_1" && r.leaveType === "CASUAL")
    .reduce((acc, r) => acc + getDaysDifference(new Date(r.startDate), new Date(r.endDate)) * (r.duration === "HALF" ? 0.5 : 1), 0);

  const medicalTaken = approvedThisYear
    .filter((r) => r.category === "MONTHLY_POLICY_1" && r.leaveType === "MEDICAL")
    .reduce((acc, r) => acc + getDaysDifference(new Date(r.startDate), new Date(r.endDate)) * (r.duration === "HALF" ? 0.5 : 1), 0);

  const semiAnnualTaken = approvedThisYear
    .filter((r) => r.category === "SEMI_ANNUAL_POLICY_2")
    .reduce((acc, r) => acc + getDaysDifference(new Date(r.startDate), new Date(r.endDate)), 0);

  const approvalRate = leaveRequests.length > 0
    ? Math.round((leaveRequests.filter((r) => r.status === "APPROVED").length / leaveRequests.length) * 100)
    : 100;

  const pendingCount = leaveRequests.filter(r => r.status === "PENDING").length;

  const { start: today, end: tomorrow } = getTodayRange();
  const onLeave = await prisma.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: today },
      endDate: { gte: today },
      user: {
        id: { not: session.user.id },
        OR: [
          { departmentId: user?.departmentId },
          { managerId: session.user.id },
          { managerId: user?.managerId }
        ]
      }
    },
    include: { 
      user: { 
        include: { 
          department: true,
          manager: true
        } 
      } 
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const teamOnLeave = onLeave
    .slice(0, 5)
    .map((l) => ({
      id: l.user.id,
      name: l.user.name || "Unknown",
      role: l.user.department?.name || "Team Member",
      startDate: l.startDate,
      endDate: l.endDate,
      duration: l.duration,
      halfDayType: l.halfDayType,
      leaveType: l.category === "UNPAID" ? "Unpaid" : "Paid"
    }));

  return {
    success: true,
    data: {
      userName: user?.name || "Employee",
      sessionStatus,
      autoPunchOutCount: user?.autoPunchOutCount ?? 0,
      balances: {
        casualTaken,
        medicalTaken,
        semiAnnualTaken,
        casualRemaining: Number(balances.remainingFull || 0),
        medicalRemaining: Number(balances.semiAnnualRemaining || 0),
      },
      stats: { approvalRate, pendingCount },
      leaveRequests,
      teamOnLeave: teamOnLeave,
      holidays: (await getUpcomingHolidays(3)).data || [],
      announcements: (await getAnnouncements(user?.departmentId || undefined)).data || [],
      notifications: (await getNotifications()).data || []
    }
  };
}

// --- Accountant Dashboard Stats ---
export async function getAccountantDashboardStats(reqMonth?: number, reqYear?: number) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SYSTEM_ADMIN";
  if (!session?.user || (session.user.role !== "ACCOUNTANT" && !isAdmin)) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const currentYear = reqYear || now.getFullYear();
  const currentMonth = reqMonth || now.getMonth() + 1;

  const startOfMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const usersToProcess = await prisma.user.findMany({
    where: {
      role: { in: ["EMPLOYEE", "ACCOUNTANT"] },
      createdAt: { lte: endOfMonth }
    },
    select: { id: true }
  });

  await Promise.all(usersToProcess.map(u => ensureBalance(u.id, currentMonth, currentYear)));

  const users = await prisma.user.findMany({
    where: {
      role: { in: ["EMPLOYEE", "ACCOUNTANT"] },
      createdAt: { lte: endOfMonth }
    },
    include: {
      attendances: {
        where: {
          date: { gte: startOfMonth, lte: endOfMonth }
        }
      },
      leaveBalances: {
        where: {
          OR: [
            { month: currentMonth, year: currentYear },
            { month: prevMonth, year: prevYear }
          ]
        }
      },
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { gte: startOfMonth, lte: endOfMonth }
        }
      },
      allowances: {
        where: {
          OR: [
            { fromDate: { gte: startOfMonth, lte: endOfMonth } },
            { toDate: { gte: startOfMonth, lte: endOfMonth } },
            { fromDate: { lte: startOfMonth }, toDate: { gte: endOfMonth } }
          ]
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  let totalLatesSystemWide = 0;
  let totalEncashments = 0;
  let totalLwpSystemWide = 0;
  let totalAllowancesSystemWide = 0;

  const reportData = users.map(user => {
    const attendances = user.attendances;
    const currentBalance = user.leaveBalances.find(lb => lb.month === currentMonth && lb.year === currentYear);

    let allowanceDays = 0;
    user.allowances.forEach(allw => {
      const overlapStart = allw.fromDate > startOfMonth ? allw.fromDate : startOfMonth;
      const overlapEnd = allw.toDate < endOfMonth ? allw.toDate : endOfMonth;
      if (overlapEnd >= overlapStart) {
        allowanceDays += Math.ceil(Math.abs(overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
    });

    const policy1FullUsed = currentBalance?.fullTaken ?? 0;
    const policy1ShortUsed = currentBalance?.shortTaken ?? 0;
    const policy2Used = currentBalance?.semiAnnualTaken ?? 0;
    const unpaidTaken = currentBalance?.unpaidTaken ?? 0;

    const totalLate = attendances.filter(a => a.isLate).length;
    const specialCaseLate = attendances.filter(a => a.isLate && a.isLateSpecialCase).length;
    const punishableLate = totalLate - specialCaseLate;
    const lateDeduction = punishableLate > 3 ? Math.ceil((punishableLate - 3) / 3) * 0.5 : 0;

    totalLatesSystemWide += totalLate;
    const lwpDays = unpaidTaken + lateDeduction;
    totalLwpSystemWide += lwpDays;
    totalEncashments += (currentBalance?.encashed ?? 0);
    totalAllowancesSystemWide += allowanceDays;

    return {
      id: user.id,
      name: user.name || user.email,
      role: user.role,
      totalPresent: attendances.length,
      leavesTaken: policy1FullUsed + policy1ShortUsed + policy2Used + unpaidTaken,
      totalLate,
      specialCaseLate,
      punishableLate,
      lwpDays,
      encashableDays: currentBalance?.encashed ?? 0,
      allowanceDays,
      balances: {
        full: currentBalance?.remainingFull ?? 0,
        short: currentBalance?.remainingShort ?? 0,
        semiAnnual: currentBalance?.semiAnnualRemaining ?? 0,
      },
      offSiteCount: attendances.filter(a => a.isOutsideOffice).length
    };
  });

  const recentApprovals = await prisma.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      updatedAt: { gte: startOfMonth }
    },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 20
  });

  return {
    success: true,
    data: {
      reportData,
      recentApprovals: recentApprovals.map((req: any) => ({
        id: req.id,
        employeeName: `${req.user.name || req.user.email}`,
        role: req.user.role,
        startDate: new Date(req.startDate).toISOString().split('T')[0],
        endDate: new Date(req.endDate).toISOString().split('T')[0],
        category: req.category,
        duration: req.duration,
        halfDayType: req.halfDayType,
        leaveType: req.leaveType,
        systemNote: req.systemNote,
        updatedAt: req.updatedAt
      })),
      stats: {
        totalStaff: users.length,
        totalLates: totalLatesSystemWide,
        totalEncashments: totalEncashments,
        totalLwp: totalLwpSystemWide,
        totalAllowances: totalAllowancesSystemWide,
        currentMonthName: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }),
        currentYear,
        currentMonth
      }
    }
  };
}
