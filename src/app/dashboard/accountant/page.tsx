import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, AlertCircle } from "lucide-react";
import { SplitActionRow } from "@/components/accountant/split-action-row";
import { RequestLeaveButton } from "@/components/leave/request-leave-button";
import { LeaveBalanceCard } from "@/components/leave/leave-balance-card";
import { RecentRequestsCard } from "@/components/leave/recent-requests-card";
import { PunchCard } from "@/components/attendance/punch-card";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayRange } from "@/lib/attendance-helper";

export const dynamic = 'force-dynamic';

async function getPendingSplits() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const balances = await prisma.leaveBalance.findMany({
    include: { user: true }
  });

  const pending = balances.filter((b: any) => b.remainingFull % 1 !== 0);

  return pending.map((b: any) => ({
    userId: b.user.id,
    name: b.user.name || b.user.email,
    department: "Various",
    remainingBalance: b.remainingFull,
  }));
}

async function getAccountantAttendance() {
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

async function getAccountantPersonalData() {
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

export default async function AccountantDashboard() {
  const pendingSplits = await getPendingSplits();
  const personalData = await getAccountantPersonalData();
  const attendanceStatus = await getAccountantAttendance();

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Month-End Processing</h1>
          <p className="text-muted-foreground mt-1">Resolve fractional leave balances for the previous month.</p>
        </div>
        <RequestLeaveButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PunchCard initialStatus={attendanceStatus} />
        <div className="md:col-span-2">
            {personalData && <LeaveBalanceCard balances={personalData.balances} />}
        </div>
        <div className="col-span-1">
          {personalData && <RecentRequestsCard requests={personalData.recentRequests} />}
        </div>
      </div>

      <Card className="shadow-sm border-amber-200/50">
        <CardHeader className="bg-amber-50/50 border-b border-amber-100 rounded-t-xl pb-4">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            Action Required: Policy 1 Fractional Balances
          </CardTitle>
          <CardDescription className="text-amber-700/80">
            The following employees ended the month with half-day balances. Please allocate their remaining balance between Carry Forward and Encashment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {pendingSplits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calculator className="w-12 h-12 mb-4 text-border" />
              <p>All fractional balances have been processed.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/30">
                  <tr className="border-b">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total to Split</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Allocation</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {pendingSplits.map((emp: any) => (
                    <SplitActionRow key={emp.userId} employee={emp} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}