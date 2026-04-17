import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PunchCard } from "@/components/features/attendance/punch-card";
import {
  CalendarDays,
  AlertCircle,
  Clock as ClockIcon,
  CheckCircle2,
  History,
  Users,
  PieChart,
  CalendarRange,
  Bell,
  ArrowRight
} from "lucide-react";
import { RequestLeaveButton } from "@/components/features/leave/request-leave-button";
import { AllowanceRequestDialog } from "@/components/features/leave/allowance-request-dialog";
import { DashboardTabs } from "@/components/features/dashboard/dashboard-tabs";
import { StatWidget } from "@/components/features/dashboard/stat-widget";
import { TeamOnLeave } from "@/components/features/dashboard/team-on-leave";
import { UpcomingLeave } from "@/components/features/dashboard/upcoming-leave";
import Link from "next/link";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayRange } from "@/lib/attendance-helper";
import { ensureBalance } from "@/actions/leave";
import { processAutoPunchOuts } from "@/lib/auto-punch-out";

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

  const recentLogs = await prisma.attendance.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 4
  });

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate stats based on Policy: 12 Casual, 12 Sick yearly
  const approvedThisYear = leaveRequests.filter(
    (r) => r.status === "APPROVED" && new Date(r.startDate).getFullYear() === currentYear
  );

  const casualTaken = approvedThisYear
    .filter((r) => r.leaveType === "CASUAL")
    .reduce((acc, r) => {
      const diff = Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return acc + diff;
    }, 0);

  const medicalTaken = approvedThisYear
    .filter((r) => r.leaveType === "MEDICAL")
    .reduce((acc, r) => {
      const diff = Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return acc + diff;
    }, 0);

  const approvalRate = leaveRequests.length > 0
    ? Math.round((leaveRequests.filter((r) => r.status === "APPROVED").length / leaveRequests.length) * 100)
    : 100;

  const pendingCount = leaveRequests.filter(r => r.status === "PENDING").length;

  // Staff members currently on leave (Global visibility for transparency)
  let teamOnLeave: any[] = [];
  const { start: today, end: tomorrow } = getTodayRange();

  // 1. Fetch people who have already punched in today
  const todayAttendance = await prisma.attendance.findMany({
    where: { date: { gte: today, lte: tomorrow } },
    select: { userId: true }
  });
  const presentIds = new Set(todayAttendance.map(a => a.userId));

  // 2. Fetch people with approved leaves covering today
  const onLeave = await prisma.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: today },
      endDate: { gte: today },
      user: {
        id: { not: session.user.id }
      }
    },
    include: {
      user: {
        include: { department: true }
      }
    },
    take: 10 // Fetch more then filter
  });

  // 3. Only show in widget if they ARE supposed to be out AND haven't punched in
  teamOnLeave = onLeave
    .filter(l => !presentIds.has(l.userId))
    .slice(0, 5) // Cap at 5 displayable items
    .map((l) => ({
    id: l.user.id,
    name: l.user.name || "Unknown",
    role: l.user.role || "Team Member",
    startDate: l.startDate,
    endDate: l.endDate,
    leaveType: l.category === "UNPAID" ? "Unpaid" : "Paid"
  }));

  return {
    userName: user?.name || "Employee",
    attendanceStatus,
    autoPunchOutCount: user?.autoPunchOutCount ?? 0,
    balances: {
      monthlyFull: balances?.remainingFull ?? 0,
      monthlyShort: balances?.remainingShort ?? 0,
      semiAnnual: balances?.semiAnnualRemaining ?? 0,
    },
    stats: {
      casualTaken,
      medicalTaken,
      casualRemaining: Math.max(0, 12 - casualTaken),
      medicalRemaining: Math.max(0, 12 - medicalTaken),
      approvalRate,
      pendingCount,
      teamCount: teamOnLeave.length
    },
    recentLogs: recentLogs.map((log: any) => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      in: log.punchIn ? new Date(log.punchIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A",
      out: log.isAutoPunchOut ? "AUTO" : (log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "---"),
      status: log.isAutoPunchOut ? "FORGOTTEN" : log.isLate ? "LATE" : "ON_TIME"
    })),
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
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Top Section: Greeting & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {greeting}, {data.userName.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Manage your attendance and leave requests from one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AllowanceRequestDialog />
            <RequestLeaveButton />
          </div>
        </div>

        <DashboardTabs />
      </div>

      {/* Row 1: Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatWidget
          title="Casual Leave Taken"
          value={data.stats.casualTaken}
          unit="days"
          description={`${data.stats.casualRemaining} days remaining out of 12`}
          icon={<CalendarRange className="size-4" />}
          progress={(data.stats.casualTaken / 12) * 100}
          progressColor="bg-indigo-500"
        />
        <StatWidget
          title="Sick Leave Taken"
          value={data.stats.medicalTaken}
          unit="days"
          description={`${data.stats.medicalRemaining} days remaining out of 12`}
          icon={<AlertCircle className="size-4 text-rose-500" />}
          progress={(data.stats.medicalTaken / 12) * 100}
          progressColor="bg-rose-500"
        />
        <StatWidget
          title="Approval Rate"
          value={`${data.stats.approvalRate}%`}
          description="Consistent request history"
          icon={<PieChart className="size-4 text-emerald-500" />}
          progress={data.stats.approvalRate}
          progressColor="bg-emerald-500"
        />
        <StatWidget
          title="Pending Request"
          value={data.stats.pendingCount}
          unit={data.stats.pendingCount === 1 ? "request" : "requests"}
          description="Awaiting manager review"
          icon={<History className="size-4 text-amber-500" />}
        />
      </div>

      {/* Row 2: Attendance & Leave Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PunchCard
              initialStatus={data.attendanceStatus}
              autoPunchOutCount={data.autoPunchOutCount}
              warningThreshold={3}
            />
            <UpcomingLeave requests={data.leaveRequests.map(r => ({
              id: r.id,
              category: r.category === "MONTHLY_POLICY_1" ? (r.leaveType === "CASUAL" ? "Casual" : "Sick") : "Paid",
              startDate: r.startDate,
              endDate: r.endDate,
              status: r.status,
              days: Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            }))} />
          </div>

          {/* Notifications Mockup */}
          <Card className="shadow-sm border-border/40 overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40 p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                <div className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  <div className="p-1.5 rounded-full bg-emerald-100 mt-1">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Your leave request for Mar 10-11 has been approved</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">2 days ago</p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  <div className="p-1.5 rounded-full bg-blue-100 mt-1">
                    <Bell className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Remember to submit your timesheet for this week</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">1 days ago</p>
                  </div>
                </div>
              </div>
              <Link href="#" className="p-3 block text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-border/40">
                View All Notifications
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <TeamOnLeave members={data.teamOnLeave} />
        </div>
      </div>
    </div>
  );
}