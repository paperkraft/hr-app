import { AttendanceCard } from "@/components/features/attendance/punch-card";
import { RequestLeaveButton } from "@/components/features/leave/request-leave-button";
import { AllowanceRequestDialog } from "@/components/features/leave/allowance-request-dialog";
import { DashboardTabs } from "@/components/features/dashboard/dashboard-tabs";
import { TeamOnLeave } from "@/components/features/dashboard/team-on-leave";
import { UpcomingLeave } from "@/components/features/dashboard/upcoming-leave";
import { NotificationCenter } from "@/components/features/dashboard/notification-center";
import { LeaveBalanceOverview } from "@/components/features/dashboard/leave-balance-overview";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayRange } from "@/lib/attendance-helper";
import { ensureBalance } from "@/actions/leave";
import { processAutoPunchOuts } from "@/lib/auto-punch-out";
import { PageContainer } from "@/components/ui";

export const dynamic = 'force-dynamic';

async function getEmployeeData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await processAutoPunchOuts(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { department: true }
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const balances = await ensureBalance(session.user.id, currentMonth, currentYear);

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
    .filter((r) => r.leaveType === "CASUAL")
    .reduce((acc, r) => {
      let days = Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (r.duration === "HALF") days = 0.5 * days;
      if (r.duration === "SHORT") days = 0;
      return acc + days;
    }, 0);

  const medicalTaken = approvedThisYear
    .filter((r) => r.leaveType === "MEDICAL")
    .reduce((acc, r) => {
      let days = Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (r.duration === "HALF") days = 0.5 * days;
      return acc + days;
    }, 0);

  const approvalRate = leaveRequests.length > 0
    ? Math.round((leaveRequests.filter((r) => r.status === "APPROVED").length / leaveRequests.length) * 100)
    : 100;

  const pendingCount = leaveRequests.filter(r => r.status === "PENDING").length;

  const { start: today, end: tomorrow } = getTodayRange();
  const todayAttendance = await prisma.attendance.findMany({
    where: { date: { gte: today, lte: tomorrow } },
    select: { userId: true }
  });
  const presentIds = new Set(todayAttendance.map(a => a.userId));

  const onLeave = await prisma.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: today },
      endDate: { gte: today },
      user: { id: { not: session.user.id } }
    },
    include: { user: { include: { department: true } } },
    take: 10
  });

  const teamOnLeave = onLeave
    .filter(l => !presentIds.has(l.userId))
    .slice(0, 5)
    .map((l) => ({
      id: l.user.id,
      name: l.user.name || "Unknown",
      role: l.user.department?.name || "Team Member",
      startDate: l.startDate,
      endDate: l.endDate,
      leaveType: l.category === "UNPAID" ? "Unpaid" : "Paid"
    }));

  return {
    userName: user?.name || "Employee",
    sessionStatus,
    autoPunchOutCount: user?.autoPunchOutCount ?? 0,
    balances: {
      casualTaken,
      medicalTaken,
      casualRemaining: Math.max(0, 12 - casualTaken),
      medicalRemaining: Math.max(0, 12 - medicalTaken),
    },
    stats: { approvalRate, pendingCount },
    leaveRequests,
    teamOnLeave
  };
}

export default async function EmployeeDashboard() {
  const data = await getEmployeeData();
  if (!data) return null;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {greeting}, {data.userName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AllowanceRequestDialog />
          <RequestLeaveButton />
        </div>
      </div>

      {/* Navigation Tabs */}
      <DashboardTabs />

      {/* TOP PRIORITY ROW: Check In/Out + Leave Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Check In/Out — Primary daily action, first and prominent */}
        <div className="lg:col-span-5">
          <AttendanceCard
            initialStatus={data.sessionStatus}
            autoPunchOutCount={data.autoPunchOutCount}
            warningThreshold={3}
          />
        </div>

        {/* Leave Balance — 2×2 stat grid alongside attendance */}
        <div className="lg:col-span-7">
          <LeaveBalanceOverview
            casual={{ taken: data.balances.casualTaken, remaining: data.balances.casualRemaining, total: 12 }}
            sick={{ taken: data.balances.medicalTaken, remaining: data.balances.medicalRemaining, total: 12 }}
            approvalRate={data.stats.approvalRate}
            pendingCount={data.stats.pendingCount}
          />
        </div>
      </div>

      {/* SECONDARY ROW: Upcoming Leave + Team on Leave + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <UpcomingLeave requests={data.leaveRequests.map(r => ({
              id: r.id,
              category: r.category === "MONTHLY_POLICY_1" ? (r.leaveType === "CASUAL" ? "Casual" : "Sick") : "Paid",
              startDate: r.startDate,
              endDate: r.endDate,
              status: r.status,
              days: Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            }))} />
            <TeamOnLeave members={data.teamOnLeave} />
          </div>
        </div>
        <div className="lg:col-span-4">
          <NotificationCenter />
        </div>
      </div>
    </PageContainer>
  );
}