import { PunchCard } from "@/components/features/attendance/punch-card";
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
import {
  PageContainer,
  PageHeader,
  PageSection,
  Grid,
  StatCard,
  Divider
} from "@/components/ui";

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

  let attendanceStatus: "PENDING" | "PUNCHED_IN" | "PUNCHED_OUT" = "PENDING";
  if (todaysLog) {
    attendanceStatus = todaysLog.punchOut ? "PUNCHED_OUT" : "PUNCHED_IN";
  }

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate stats
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

  // Team visibility logic
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
    attendanceStatus,
    autoPunchOutCount: user?.autoPunchOutCount ?? 0,
    balances: {
      casualTaken,
      medicalTaken,
      casualRemaining: Math.max(0, 12 - casualTaken),
      medicalRemaining: Math.max(0, 12 - medicalTaken),
    },
    stats: {
      approvalRate,
      pendingCount,
    },
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
    <PageContainer maxWidth="full" className="py-8">
      {/* Header Section */}
      <div className="space-y-6 mb-8">
        <PageHeader
          title={`${greeting}, ${data.userName.split(' ')[0]} 👋`}
          description="Manage your attendance and leave requests from one place."
          breadcrumb={<span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Dashboard / Home</span>}
          action={
            <div className="flex items-center gap-3">
              <AllowanceRequestDialog />
              <RequestLeaveButton />
            </div>
          }
        />
        <DashboardTabs />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Row 1: Attendance & Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
             <div className="xl:col-span-1">
                <PunchCard
                  initialStatus={data.attendanceStatus}
                  autoPunchOutCount={data.autoPunchOutCount}
                  warningThreshold={3}
                />
             </div>
             <div className="xl:col-span-2">
                <LeaveBalanceOverview 
                  casual={{ taken: data.balances.casualTaken, remaining: data.balances.casualRemaining, total: 12 }}
                  sick={{ taken: data.balances.medicalTaken, remaining: data.balances.medicalRemaining, total: 12 }}
                />
             </div>
          </div>

          {/* Row 2: Notifications & Quick Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <NotificationCenter />
             <UpcomingLeave requests={data.leaveRequests.map(r => ({
                id: r.id,
                category: r.category === "MONTHLY_POLICY_1" ? (r.leaveType === "CASUAL" ? "Casual" : "Sick") : "Paid",
                startDate: r.startDate,
                endDate: r.endDate,
                status: r.status,
                days: Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
             }))} />
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-1 space-y-8">
           <TeamOnLeave members={data.teamOnLeave} />
           
           {/* Quick Stats Summary Card */}
           <PageSection title="Performance" description="Summary for current month" className="animate-fade-in-up">
              <div className="grid grid-cols-1 gap-4 p-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                   <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Approval Rate</span>
                   <span className="text-lg font-black text-emerald-700">{data.stats.approvalRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                   <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Pending Requests</span>
                   <span className="text-lg font-black text-amber-700">{data.stats.pendingCount}</span>
                </div>
              </div>
           </PageSection>
        </div>
      </div>
    </PageContainer>
  );
}