import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Clock, FileText, IndianRupee } from "lucide-react";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExportLedgerButton } from "@/components/accountant/export-ledger-button";
import { MasterReportTable } from "@/components/accountant/master-report-table";
import { MonthYearPicker } from "@/components/accountant/month-year-picker";

export const dynamic = 'force-dynamic';

function getDaysDifference(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
}

async function getPayrollReportData(reqMonth?: number, reqYear?: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ACCOUNTANT") {
    redirect("/dashboard/employee");
  }

  const now = new Date();
  const currentYear = reqYear || now.getFullYear();
  const currentMonth = reqMonth || now.getMonth() + 1; // 1-12

  // Calculate boundaries for the current month
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // Fetch all employees/managers along with their Attendance, Balances, and Approved Leaves
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["EMPLOYEE", "MANAGER"] }
    },
    include: {
      attendances: {
        where: {
          date: { gte: startOfMonth, lte: endOfMonth }
        }
      },
      leaveBalances: {
        where: {
          month: currentMonth,
          year: currentYear
        }
      },
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { gte: startOfMonth, lte: endOfMonth }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  let totalLatesSystemWide = 0;
  let totalEncashments = 0;
  let totalLwpSystemWide = 0;

  const reportData = users.map(user => {
    const attendances = user.attendances;
    const balance = user.leaveBalances[0];

    // Count both standard and special case late marks
    const totalLate = attendances.filter(a => a.isLate).length;
    const specialCaseLate = attendances.filter(a => a.isLate && a.isLateSpecialCase).length;
    const punishableLate = totalLate - specialCaseLate;

    totalLatesSystemWide += totalLate;

    // RULE: If user has late mark, first three counts are exempted, later three are considered as half-day.
    // Every 3 punishable late marks (after the first 3) result in 0.5 LWP.
    const lateDeduction = punishableLate > 3 ? Math.ceil((punishableLate - 3) / 3) * 0.5 : 0;

    // Calculate Explicit LWP (Unpaid Leaves)
    let explicitLwp = 0;
    user.leaveRequests.forEach(req => {
      if (req.category === "UNPAID") {
        const diffDays = getDaysDifference(req.startDate, req.endDate);
        const actualDays = req.duration === "HALF" ? 0.5 * diffDays : diffDays;
        explicitLwp += actualDays;
      }
    });

    // Total LWP = Explicit LWP + Late Mark Penalties
    const lwpDays = explicitLwp + lateDeduction;
    totalLwpSystemWide += lwpDays;

    const remainingFull = balance?.remainingFull ?? 0;
    const encashableDays = remainingFull > 1 ? (remainingFull - 1) : 0;
    totalEncashments += encashableDays;

    return {
      id: user.id,
      name: user.name || user.email,
      role: user.role,
      totalPresent: attendances.length,
      totalLate: totalLate,
      specialCaseLate,
      punishableLate,
      lwpDays: lwpDays,
      encashableDays,
      balances: {
        full: remainingFull,
        short: balance?.remainingShort ?? 0,
        semiAnnual: balance?.semiAnnualRemaining ?? 0,
      }
    };
  });

  return {
    reportData,
    stats: {
      totalStaff: users.length,
      totalLates: totalLatesSystemWide,
      totalEncashments: totalEncashments,
      totalLwp: totalLwpSystemWide,
      currentMonthName: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }),
      currentYear,
      currentMonth
    }
  };
}

export default async function AccountantDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ m?: string; y?: string }> 
}) {
  const params = await searchParams;
  const m = params.m ? parseInt(params.m) : undefined;
  const y = params.y ? parseInt(params.y) : undefined;

  const { reportData, stats } = await getPayrollReportData(m, y);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Payroll & Processing
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-3 mt-1">
            <p className="text-muted-foreground text-sm md:text-base">
              Comprehensive attendance and leave report for {stats.currentMonthName} {stats.currentYear}.
            </p>
            <div className="hidden md:block h-4 w-px bg-border/60 mx-1" />
            <MonthYearPicker currentMonth={stats.currentMonth} currentYear={stats.currentYear} />
          </div>
        </div>
        <ExportLedgerButton data={reportData} month={stats.currentMonthName} />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Processable Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStaff}</div>
            <p className="text-xs text-muted-foreground mt-1">Employees & Managers</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-500" />
              Total Encashments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats.totalEncashments}</div>
            <p className="text-xs text-muted-foreground mt-1">Days to pay out system-wide</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Total Late Marks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.totalLates}</div>
            <p className="text-xs text-muted-foreground mt-1">System-wide this month</p>
          </CardContent>
        </Card>

        {/* LWP Quick Stat */}
        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-destructive" />
              Total LWP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.totalLwp}</div>
            <p className="text-xs text-muted-foreground mt-1">Unpaid leaves system-wide</p>
          </CardContent>
        </Card>
      </div>

      {/* The Master Data Table */}
      <Card className="shadow-sm border-border/40 p-0">
        <CardHeader className="border-b border-border/40 bg-muted/10 p-4">
          <CardTitle className="text-lg">Master Attendance & Leave Report</CardTitle>
          <CardDescription>Consolidated data required for end-of-month salary calculations.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <MasterReportTable data={reportData} />
        </CardContent>
      </Card>

    </div>
  );
}