import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PunchCard } from "@/components/features/attendance/punch-card";
import { CalendarDays, AlertCircle, Clock as ClockIcon, CheckCircle2 } from "lucide-react";
import { RequestLeaveButton } from "@/components/features/leave/request-leave-button";
import { AllowanceRequestDialog } from "@/components/features/leave/allowance-request-dialog";
import { LeaveBalanceCard } from "@/components/features/leave/leave-balance-card";
import { RecentRequestsCard } from "@/components/features/leave/recent-requests-card";
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
  if (!session?.user?.id) {
    return {
      attendanceStatus: "PENDING" as const,
      balances: { monthlyFull: 0, monthlyShort: 0, semiAnnual: 0 },
      recentLogs: [],
      recentRequests: [],
      userName: "Employee",
      autoPunchOutCount: 0
    };
  }

  // 1. Process any forgotten punch-outs from previous days
  await processAutoPunchOuts(session.user.id);

  // 2. Fetch User to get autoPunchOutCount
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, autoPunchOutCount: true }
  });

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
    out: log.isAutoPunchOut ? "AUTO" : (log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "---"),
    late: log.isLate,
    lateSpecialCase: log.isLateSpecialCase,
    isAutoPunchOut: log.isAutoPunchOut
  }));

  const recentRequests = await prisma.leaveRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });

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
      const halfStr = req.duration === "HALF" && req.halfDayType ? ` (${req.halfDayType === 'FIRST_HALF' ? '1st Half' : '2nd Half'})` : "";
      
      return {
        id: req.id,
        dates: req.duration === "SHORT" ? `${dateStr}${timeStr}` : (req.duration === "HALF" ? `${dateStr}${halfStr}` : `${dateStr} - ${new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`),
        status: req.status,
        duration: req.duration,
        category: req.category === "MONTHLY_POLICY_1" ? `Monthly${req.leaveType ? ` (${req.leaveType.charAt(0) + req.leaveType.slice(1).toLowerCase()})` : ""}` : req.category === "UNPAID" ? "Unpaid" : "Semi-Annual",
        managerNote: req.managerNote,
      };
    }),
    userName: user?.name ?? session.user.name ?? "Employee",
    autoPunchOutCount: (user as any)?.autoPunchOutCount ?? 0,
    autoPunchOutThreshold: (config as any)?.autoPunchOutWarningThreshold ?? 3
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
        <div className="flex items-center gap-3">
          <AllowanceRequestDialog />
          <RequestLeaveButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PunchCard 
            initialStatus={data.attendanceStatus} 
            autoPunchOutCount={data.autoPunchOutCount}
            warningThreshold={data.autoPunchOutThreshold}
          />
        </div>
        <div className="lg:col-span-2">
          <LeaveBalanceCard balances={data.balances} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card className="shadow-sm border-border/40 hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/5 p-4 shrink-0 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-semibold">Attendance Log</CardTitle>
            </div>
            <Link 
              href="/dashboard/employee/attendance" 
              className="text-xs font-medium text-primary hover:underline underline-offset-4"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <div className="divide-y divide-border/40">
              {data.recentLogs.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-muted-foreground h-full">
                  <CalendarDays className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs">No records yet.</p>
                </div>
              ) : (
                data.recentLogs.map((log: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-xs">{log.date}</span>
                      <div className="flex items-center text-[10px] text-muted-foreground font-mono bg-secondary/40 px-1.5 py-0.5 rounded w-fit">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{log.in}</span>
                        <span className="mx-1.5 text-border">—</span>
                        <span>{log.out}</span>
                      </div>
                    </div>
                    {log.isAutoPunchOut ? (
                      <Badge variant="outline" className="text-[9px] h-5 border-amber-200 bg-amber-50 text-amber-600 font-bold px-1.5">
                        <AlertCircle className="w-2.5 h-2.5 mr-1" /> Forgotten
                      </Badge>
                    ) : log.lateSpecialCase ? (
                      <Badge variant="outline" className="text-[9px] h-5 border-blue-200 bg-blue-50 text-blue-600 font-bold px-1.5">
                        <ClockIcon className="w-2.5 h-2.5 mr-1" /> Covered
                      </Badge>
                    ) : log.late ? (
                      <Badge variant="outline" className="text-[9px] h-5 border-destructive/20 bg-destructive/5 text-destructive font-bold px-1.5">
                        <AlertCircle className="w-2.5 h-2.5 mr-1" /> Late
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] h-5 border-emerald-100 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 font-bold px-1.5">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> On Time
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