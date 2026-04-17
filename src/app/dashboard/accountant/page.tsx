import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Clock, FileText, IndianRupee, MapPin } from "lucide-react";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExportLedgerButton } from "@/components/features/accountant/export-ledger-button";
import { MasterReportTable } from "@/components/features/accountant/master-report-table";
import { MonthYearPicker } from "@/components/features/accountant/month-year-picker";
import { ensureBalance } from "@/actions/leave";
import Link from "next/link";

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
      },
      allowances: {
        where: {
          OR: [
            { fromDate: { gte: startOfMonth, lte: endOfMonth } },
            { toDate: { gte: startOfMonth, lte: endOfMonth } },
            { fromDate: { lte: startOfMonth }, toDate: { gte: endOfMonth } }
          ]
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  let totalLatesSystemWide = 0;
  let totalEncashments = 0;
  let totalLwpSystemWide = 0;
  let totalAllowancesSystemWide = 0;

  const reportData = users.map(user => {
    const attendances = user.attendances;
    const currentBalance = user.leaveBalances.find(lb => lb.month === currentMonth && lb.year === currentYear);
    const prevBalance = user.leaveBalances.find(lb => lb.month === prevMonth && lb.year === prevYear);

    // Calculate Allowance days for this month
    let allowanceDays = 0;
    user.allowances.forEach(allw => {
      const overlapStart = allw.fromDate > startOfMonth ? allw.fromDate : startOfMonth;
      const overlapEnd = allw.toDate < endOfMonth ? allw.toDate : endOfMonth;

      if (overlapEnd >= overlapStart) {
        const diffTime = Math.abs(overlapEnd.getTime() - overlapStart.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        allowanceDays += diffDays;
      }
    });

    // USE DATABASE COUNTERS as source of truth
    const policy1FullUsed = currentBalance?.fullTaken ?? 0;
    const policy1ShortUsed = currentBalance?.shortTaken ?? 0;
    const policy2Used = currentBalance?.semiAnnualTaken ?? 0;
    const unpaidTaken = currentBalance?.unpaidTaken ?? 0;

    // Total Leaves Taken for month-level summary (including short leaves)
    const totalLeavesTakenInMonth = policy1FullUsed + policy1ShortUsed + policy2Used + unpaidTaken;

    // Late Mark Penalties (still calculated from attendance)
    const totalLate = attendances.filter(a => a.isLate).length;
    const specialCaseLate = attendances.filter(a => a.isLate && a.isLateSpecialCase).length;
    const punishableLate = totalLate - specialCaseLate;
    const lateDeduction = punishableLate > 3 ? Math.ceil((punishableLate - 3) / 3) * 0.5 : 0;

    totalLatesSystemWide += totalLate;

    // Total LWP = Database Unpaid (manual + overflow) + Late Mark Penalties
    const lwpDays = unpaidTaken + lateDeduction;
    totalLwpSystemWide += lwpDays;

    totalEncashments += (currentBalance?.encashed ?? 0);
    totalAllowancesSystemWide += allowanceDays;

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
      encashableDays: currentBalance?.encashed ?? 0,
      allowanceDays: allowanceDays,
      balances: {
        full: currentBalance?.remainingFull ?? 0,
        short: currentBalance?.remainingShort ?? 0,
        semiAnnual: currentBalance?.semiAnnualRemaining ?? 0,
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
      totalAllowances: totalAllowancesSystemWide,
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Users className="size-3 text-primary" />
              Staff
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <IndianRupee className="size-3 text-emerald-500" />
              Encash
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.totalEncashments}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Clock className="size-3 text-amber-500" />
              Late
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-600">{stats.totalLates}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="size-3 text-destructive" />
              LWP
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-destructive">{stats.totalLwp}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MapPin className="size-3 text-blue-500" />
              Allow.
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAllowances} Days</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-rose-500/20 bg-rose-500/2 cursor-pointer hover:bg-rose-500/5 transition-colors group relative overflow-hidden">
          <Link href={`/dashboard/accountant/location-logs?m=${stats.currentMonth}&y=${stats.currentYear}`}>
            <div>
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2">
                  <MapPin className="size-3" />
                  Out-Office
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-rose-600">
                    {reportData.reduce((acc, curr) => acc + curr.offSiteCount, 0)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">Punches</div>
                </div>
              </CardContent>
            </div>
          </Link>
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