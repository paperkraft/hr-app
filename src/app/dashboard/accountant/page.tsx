import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { CheckCircle2, Check, Users, Clock, FileText, IndianRupee, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CancelLeaveButton } from "@/components/features/leave/cancel-leave-button";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExportLedgerButton } from "@/components/features/accountant/export-ledger-button";
import { MasterReportTable } from "@/components/features/accountant/master-report-table";
import { MonthYearPicker } from "@/components/features/accountant/month-year-picker";
import { ensureBalance } from "@/actions/leave";
import { StatWidget } from "@/components/features/dashboard/stat-widget";
import { MaintenanceButton } from "@/components/features/accountant/maintenance-button";
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

  // Fetch recent APPROVED requests (last 20) for cancellation capability
  const recentApprovals = await prisma.leaveRequest.findMany({
    where: { 
      status: "APPROVED",
      updatedAt: { gte: startOfMonth } // Only show approvals relevant to this cycle or recent
    },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 20
  });

  return {
    reportData,
    recentApprovals: recentApprovals.map((req: any) => ({
      id: req.id,
      employeeName: `${req.user.name || req.user.email}`,
      role: req.user.role,
      startDate: new Date(req.startDate).toISOString().split('T')[0],
      endDate: new Date(req.endDate).toISOString().split('T')[0],
      category: req.category,
      duration: req.duration,
      halfDayType: req.halfDayType,
      leaveType: req.leaveType,
      systemNote: req.systemNote,
      updatedAt: req.updatedAt
    })),
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

  const { reportData, stats, recentApprovals } = await getPayrollReportData(m, y);

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
        <div className="flex items-center gap-3">
          <MaintenanceButton />
          <ExportLedgerButton data={reportData} month={stats.currentMonthName} />
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatWidget 
          title="Total Staff" 
          value={stats.totalStaff} 
          icon={<Users className="size-4 text-primary" />}
        />
        <StatWidget 
          title="Encash" 
          value={stats.totalEncashments} 
          unit="Days"
          icon={<IndianRupee className="size-4 text-emerald-500" />}
          progressColor="bg-emerald-500"
        />
        <StatWidget 
          title="Total Late" 
          value={stats.totalLates} 
          unit="Punches"
          icon={<Clock className="size-4 text-amber-500" />}
          progressColor="bg-amber-500"
        />
        <StatWidget 
          title="Total LWP" 
          value={stats.totalLwp} 
          unit="Days"
          icon={<FileText className="size-4 text-destructive" />}
          progressColor="bg-destructive"
        />
        <StatWidget 
          title="Allowance" 
          value={stats.totalAllowances} 
          unit="Days"
          icon={<MapPin className="size-4 text-blue-500" />}
          progressColor="bg-blue-500"
        />
        <Link href={`/dashboard/accountant/location-logs?m=${stats.currentMonth}&y=${stats.currentYear}`} className="block h-full">
          <StatWidget 
            title="Out-Office" 
            value={reportData.reduce((acc, curr) => acc + curr.offSiteCount, 0)} 
            unit="Punches"
            icon={<MapPin className="size-4" />}
            className="border-rose-500/20 bg-rose-500/2 hover:bg-rose-500/5 cursor-pointer"
            progressColor="bg-rose-500"
          />
        </Link>
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

      {/* Recent Approvals & Cancellation Table */}
      <Card className="shadow-sm border-border/40 p-0 gap-0">
        <CardHeader className="bg-muted/5 border-b border-border/40 p-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" />
            Recent Approvals & Maintenance
          </CardTitle>
          <CardDescription>Review and manage recently approved leaves to prevent double-counting.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground">Employee</TableHead>
                  <TableHead className="py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground">Duration</TableHead>
                  <TableHead className="py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground">Type</TableHead>
                  <TableHead className="py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground">Method / Note</TableHead>
                  <TableHead className="py-3 px-4 text-[10px] uppercase font-bold text-right text-muted-foreground">Processed</TableHead>
                  <TableHead className="py-3 px-4 text-[10px] uppercase font-bold text-right text-muted-foreground w-10">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApprovals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground italic">
                      No approval history found for this month.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentApprovals.map((req: any) => (
                    <TableRow key={req.id} className="hover:bg-muted/5">
                      <TableCell className="py-3 px-4">
                        <div className="font-semibold text-sm">{req.employeeName}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{req.role}</div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-xs font-medium">
                        <div className="flex flex-col">
                          <span>{req.startDate === req.endDate ? req.startDate : `${req.startDate} to ${req.endDate}`}</span>
                          {req.duration === 'HALF' && (
                            <span className="text-[10px] text-primary font-bold uppercase tracking-tight">
                              Half Day ({req.halfDayType === 'FIRST_HALF' ? '1st Half' : '2nd Half'})
                            </span>
                          )}
                          {req.duration === 'SHORT' && (
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">
                              Short Leave
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase truncate max-w-[100px] border-border/60">
                          {req.category.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {req.systemNote ? (
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-tight shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40">
                              System
                            </Badge>
                            <span className="text-[10px] text-muted-foreground italic truncate max-w-[120px]" title={req.systemNote}>
                              {req.systemNote}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-muted-foreground px-2 py-1 bg-muted/20 rounded-full w-fit flex items-center gap-1">
                            <Check className="size-3" /> Manual
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right text-[10px] font-mono whitespace-nowrap">
                        {new Date(req.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right">
                        <CancelLeaveButton requestId={req.id} employeeName={req.employeeName} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}