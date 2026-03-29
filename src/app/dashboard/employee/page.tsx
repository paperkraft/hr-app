import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PunchCard } from "@/components/attendance/punch-card";
import { CalendarDays, AlertCircle } from "lucide-react";
import { RequestLeaveButton } from "@/components/leave/request-leave-button";
import { LeaveBalanceCard } from "@/components/leave/leave-balance-card";
import { RecentRequestsCard } from "@/components/leave/recent-requests-card";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayRange } from "@/lib/attendance-helper";

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

  const balances = await prisma.leaveBalance.findUnique({
    where: {
      userId_month_year: {
        userId: session.user.id,
        month: currentMonth,
        year: currentYear
      }
    }
  });

  const recentLogs = await prisma.attendance.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 5
  });

  const { start } = getTodayRange();
  const todaysLog = recentLogs.find((log: any) => new Date(log.date) >= start);
  
  let attendanceStatus: "PENDING" | "PUNCHED_IN" | "PUNCHED_OUT" = "PENDING";
  if (todaysLog) {
    if (todaysLog.punchOut) attendanceStatus = "PUNCHED_OUT";
    else if (todaysLog.punchIn) attendanceStatus = "PUNCHED_IN";
  }

  const formattedLogs = recentLogs.map((log: any) => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    in: log.punchIn ? new Date(log.punchIn).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' }) : "N/A",
    out: log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' }) : "---",
    late: log.isLate
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
    recentRequests: recentRequests.map((req: any) => ({
      id: req.id,
      dates: `${new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      status: req.status,
      category: req.category === "MONTHLY_POLICY_1" ? "Policy 1" : "Policy 2",
    })),
    userName: session.user.name ?? "Employee"
  };
}

export default async function EmployeeDashboard() {
  const data = await getEmployeeData();

  return (
    <>
        <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {data.userName}</h1>
                    <p className="text-muted-foreground mt-1">Here is your overview for today.</p>
                </div>
                <RequestLeaveButton />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Punch Card Custom Component */}
                <PunchCard initialStatus={data.attendanceStatus} />

                <LeaveBalanceCard balances={data.balances} />
            </div>

            {/* Recent Attendance Log & Leave Requests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Recent Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {data.recentLogs.length === 0 ? (
                                <p className="py-4 text-center text-muted-foreground text-sm">No attendance records yet.</p>
                            ) : (
                                data.recentLogs.map((log: any, i: number) => (
                                <div key={i} className="flex items-center justify-between py-3">
                                    <div className="flex flex-col">
                                    <span className="font-medium">{log.date}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {log.in} — {log.out}
                                    </span>
                                    </div>
                                    {log.late ? (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Late Mark
                                    </Badge>
                                    ) : (
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                        On Time
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
    </>
  );
}