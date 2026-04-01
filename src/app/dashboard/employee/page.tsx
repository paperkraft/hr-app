import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PunchCard } from "@/components/features/attendance/punch-card";
import { CalendarDays, AlertCircle, Clock as ClockIcon, CheckCircle2 } from "lucide-react";
import { RequestLeaveButton } from "@/components/features/leave/request-leave-button";
import { LeaveBalanceCard } from "@/components/features/leave/leave-balance-card";
import { RecentRequestsCard } from "@/components/features/leave/recent-requests-card";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayRange } from "@/lib/attendance-helper";
import { ensureBalance } from "@/actions/leave";

export const dynamic = 'force-dynamic';

async function getEmployeeData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      attendanceStatus: "PENDING" as const,
      balances: { monthlyFull: 0, monthlyShort: 0, semiAnnual: 0 },
      recentLogs: [],
      recentRequests: [],
      userName: "Employee"
    };
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // This will automatically create the record if it doesn't exist (e.g. start of new month)
  const balances = await ensureBalance(session.user.id, currentMonth, currentYear);

  // 1. Fetch exactly today's log using strict boundaries to guarantee state accuracy
  const { start, end } = getTodayRange();
  const todaysLog = await prisma.attendance.findFirst({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end }
    }
  });

  let attendanceStatus: "PENDING" | "PUNCHED_IN" | "PUNCHED_OUT" = "PENDING";
  if (todaysLog) {
    if (todaysLog.punchOut) attendanceStatus = "PUNCHED_OUT";
    else attendanceStatus = "PUNCHED_IN";
  }

  // 2. Fetch recent logs separately for the history table
  const recentLogs = await prisma.attendance.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 5
  });

  const formattedLogs = recentLogs.map((log: any) => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    in: log.punchIn ? new Date(log.punchIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A",
    out: log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "---",
    late: log.isLate,
    lateSpecialCase: log.isLateSpecialCase
  }));

  const recentRequests = await prisma.leaveRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return {
    attendanceStatus,
    balances: {
      monthlyFull: balances?.remainingFull ?? 0,
      monthlyShort: balances?.remainingShort ?? 0,
      semiAnnual: balances?.semiAnnualRemaining ?? 0,
    },
    recentLogs: formattedLogs,
    recentRequests: recentRequests.map((req: any) => {
      const dateStr = new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = req.duration === "SHORT" && req.startTime ? ` (${req.startTime} - ${req.endTime})` : "";
      
      return {
        id: req.id,
        dates: req.duration === "SHORT" ? `${dateStr}${timeStr}` : `${dateStr} - ${new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        status: req.status,
        duration: req.duration,
        category: req.category === "MONTHLY_POLICY_1" ? "Policy 1" : req.category === "UNPAID" ? "Unpaid" : "Policy 2",
        managerNote: req.managerNote,
      };
    }),
    userName: session.user.name ?? "Employee"
  };
}

export default async function EmployeeDashboard() {
  const data = await getEmployeeData();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {data.userName.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Here's your attendance and leave overview for today.
          </p>
        </div>
        <RequestLeaveButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PunchCard initialStatus={data.attendanceStatus} />
        </div>
        <div className="lg:col-span-2">
          <LeaveBalanceCard balances={data.balances} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border/40 hover:shadow-md transition-shadow duration-20 p-0 gap-0">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/10 p-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Recent Attendance</CardTitle>
            </div>
            <CardDescription>Your check-in and check-out logs for the past 5 days.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {data.recentLogs.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-muted-foreground">
                  <CalendarDays className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">No attendance records yet.</p>
                </div>
              ) : (
                data.recentLogs.map((log: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">{log.date}</span>
                      <div className="flex items-center text-xs text-muted-foreground font-mono bg-secondary/30 px-2 py-1 rounded-md w-fit">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{log.in}</span>
                        <span className="mx-2 text-border">—</span>
                        <span>{log.out}</span>
                      </div>
                    </div>
                    {log.lateSpecialCase ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        <ClockIcon className="w-3 h-3 mr-1" /> Covered
                      </Badge>
                    ) : log.late ? (
                      <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
                        <AlertCircle className="w-3 h-3 mr-1" /> Late
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> On Time
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <RecentRequestsCard requests={data.recentRequests} />
      </div>
    </div>
  );
}