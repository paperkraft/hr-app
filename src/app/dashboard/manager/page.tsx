import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Inbox, Check } from "lucide-react";
import { LeaveApprovalRow } from "@/components/manager/leave-approval-row";
import { RequestLeaveButton } from "@/components/leave/request-leave-button";
import { LeaveBalanceCard } from "@/components/leave/leave-balance-card";
import { RecentRequestsCard } from "@/components/leave/recent-requests-card";
import { PunchCard } from "@/components/attendance/punch-card";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayRange } from "@/lib/attendance-helper";

export const dynamic = 'force-dynamic';

async function getPendingTeamRequests() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const requests = await prisma.leaveRequest.findMany({
    where: {
      status: "PENDING",
      user: { managerId: session.user.id }
    },
    include: { user: true },
    orderBy: { createdAt: 'asc' }
  });

  return requests.map((req: any) => ({
    id: req.id,
    employeeName: req.user.name || req.user.email,
    startDate: new Date(req.startDate).toISOString().split('T')[0],
    endDate: new Date(req.endDate).toISOString().split('T')[0],
    duration: req.duration,
    category: req.category,
    reason: req.reason || "No reason provided",
  }));
}

async function getManagerAttendance() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return "PENDING" as const;

  const { start } = getTodayRange();
  const todaysLog = await prisma.attendance.findFirst({
    where: {
      userId: session.user.id,
      date: { gte: start }
    }
  });

  if (!todaysLog) return "PENDING" as const;
  if (todaysLog.punchOut) return "PUNCHED_OUT" as const;
  return "PUNCHED_IN" as const;
}

async function getManagerPersonalData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return {
    balances: { monthlyFull: 0, monthlyShort: 0, semiAnnual: 0 },
    recentRequests: []
  };

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

  const recentRequests = await prisma.leaveRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return {
    balances: {
      monthlyFull: balances?.remainingFull ?? 0,
      monthlyShort: balances?.remainingShort ?? 0,
      semiAnnual: balances?.semiAnnualRemaining ?? 0,
    },
    recentRequests: recentRequests.map((req: any) => ({
      id: req.id,
      dates: `${new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      status: req.status,
      category: req.category === "MONTHLY_POLICY_1" ? "Policy 1" : "Policy 2",
    })),
  };
}

export default async function ManagerDashboard() {
  const pendingRequests = await getPendingTeamRequests();
  const personalData = await getManagerPersonalData();
  const attendanceStatus = await getManagerAttendance();

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Overview</h1>
          <p className="text-muted-foreground mt-1">Review your team's attendance and manage your own leaves.</p>
        </div>
        <RequestLeaveButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Quick Stats */}
        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Direct reports</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending leaves</p>
          </CardContent>
        </Card>

        <PunchCard initialStatus={attendanceStatus} />

        {personalData && <LeaveBalanceCard balances={personalData.balances} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Pending Leave Requests Table */}
          <Card className="h-full shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
              <CardDescription>Review and approve leave applications from your team members.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Check className="w-12 h-12 mb-4 text-border" />
                  <p>You're all caught up!</p>
                </div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dates & Policy</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reason</th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {pendingRequests.map((req: any) => (
                        <LeaveApprovalRow key={req.id} request={req} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          {personalData && <RecentRequestsCard requests={personalData.recentRequests} />}
        </div>
      </div>
    </div>
  );
}