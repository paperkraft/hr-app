import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Clock, FileText, IndianRupee } from "lucide-react";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExportLedgerButton } from "@/components/features/accountant/export-ledger-button";
import { MasterReportTable } from "@/components/features/accountant/master-report-table";
import { MonthYearPicker } from "@/components/features/accountant/month-year-picker";
import { ensureBalance } from "@/actions/leave";

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

  // Boundaries for current month
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // Boundaries for previous month (to get Carry Forward)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // 1. Fetch only users who existed on or before the end of this month
  const usersToProcess = await prisma.user.findMany({
    where: {
      role: { in: ["EMPLOYEE", "ACCOUNTANT"] },
      createdAt: { lte: endOfMonth }
    },
    select: { id: true }
  });

  // 2. Ensure everyone has a balance for this specific month/year
  await Promise.all(usersToProcess.map(u => ensureBalance(u.id, currentMonth, currentYear)));

  // 3. Now fetch the full data for those users (and their prev month balance)
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
      }
    },
    orderBy: { name: 'asc' }
  });

  let totalLatesSystemWide = 0;
  let totalEncashments = 0;
  let totalLwpSystemWide = 0;

  const reportData = users.map(user => {
    const attendances = user.attendances;
    const currentBalance = user.leaveBalances.find(lb => lb.month === currentMonth && lb.year === currentYear);
    const prevBalance = user.leaveBalances.find(lb => lb.month === prevMonth && lb.year === prevYear);

    // Calculate usage strictly within this month's boundaries
    let policy1FullUsed = 0;
    let policy1ShortUsed = 0;
    let policy2Used = 0;
    let explicitLwp = 0;
    let totalLeavesTakenInMonth = 0;

    user.leaveRequests.forEach(req => {
      // Intersection logic
      const intersectStart = req.startDate < startOfMonth ? startOfMonth : req.startDate;
      const intersectEnd = req.endDate > endOfMonth ? endOfMonth : req.endDate;

      if (intersectStart > intersectEnd) return; // No overlap

      const diffMs = intersectEnd.getTime() - intersectStart.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
      const actualDays = req.duration === "HALF" ? 0.5 * diffDays : diffDays;
      
      totalLeavesTakenInMonth += actualDays;

      if (req.category === "MONTHLY_POLICY_1") {
        if (req.duration === "SHORT") {
          policy1ShortUsed += 1;
        } else {
          policy1FullUsed += actualDays;
        }
      } else if (req.category === "SEMI_ANNUAL_POLICY_2") {
        policy2Used += actualDays;
      } else if (req.category === "UNPAID") {
        explicitLwp += actualDays;
      }
    });

    // Baseline from DB record state
    // Opening = Remaining in DB + Usage already deducted in DB
    // However, to show a consistent "Policy 1" report:
    const openingFull = 2.0 + (prevBalance?.carriedForward ?? 0);
    const openingShort = 1;

    // TRUST THE DATABASE for currently remaining values
    const remainingFull = currentBalance?.remainingFull ?? 0;
    const remainingShort = currentBalance?.remainingShort ?? 0;
    const semiAnnualRemaining = currentBalance?.semiAnnualRemaining ?? 0;

    // Calculate Auto-LWP: if usage exceeds opening
    const autoLwpFull = Math.max(0, policy1FullUsed - openingFull);
    const autoLwpShort = Math.max(0, policy1ShortUsed - openingShort) * 0.5;

    // Late Mark Penalties
    const totalLate = attendances.filter(a => a.isLate).length;
    const specialCaseLate = attendances.filter(a => a.isLate && a.isLateSpecialCase).length;
    const punishableLate = totalLate - specialCaseLate;
    const lateDeduction = punishableLate > 3 ? Math.ceil((punishableLate - 3) / 3) * 0.5 : 0;
    
    totalLatesSystemWide += totalLate;

    // Total LWP = Excess Leaves (Auto) + Manual Unpaid + Late Mark Penalties
    const lwpDays = autoLwpFull + autoLwpShort + explicitLwp + lateDeduction;
    totalLwpSystemWide += lwpDays;

    // Current month's potential encashment (anything above 1 day)
    const encashableDays = remainingFull > 1 ? (remainingFull - 1) : 0;
    totalEncashments += encashableDays;

    return {
      id: user.id,
      name: user.name || user.email,
      role: user.role,
      totalPresent: attendances.length,
      leavesTaken: totalLeavesTakenInMonth,
      totalLate: totalLate,
      specialCaseLate,
      punishableLate,
      lwpDays: lwpDays,
      encashableDays,
      balances: {
        full: remainingFull,
        short: remainingShort,
        semiAnnual: semiAnnualRemaining,
      },
      offSiteCount: attendances.filter(a => a.isOutsideOffice).length
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
            <p className="text-xs text-muted-foreground mt-1">Full team headcount</p>
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
          <MasterReportTable 
            data={reportData} 
            month={stats.currentMonth} 
            year={stats.currentYear} 
          />
        </CardContent>
      </Card>

    </div>
  );
}