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
import { MaintenanceButton } from "@/components/features/accountant/maintenance-button";
import Link from "next/link";
import { 
  PageContainer, 
  PageHeader, 
  PageSection, 
  Grid, 
  StatCard, 
  Divider,
  StatusBadge
} from "@/components/ui";

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
    <PageContainer maxWidth="full" className="py-8">
      {/* Header Section */}
      <PageHeader 
        title="Payroll & Processing"
        description={`Comprehensive attendance and leave report for ${stats.currentMonthName} ${stats.currentYear}.`}
        breadcrumb={<MonthYearPicker currentMonth={stats.currentMonth} currentYear={stats.currentYear} />}
        action={
          <div className="flex items-center gap-3">
            <MaintenanceButton />
            <ExportLedgerButton data={reportData} month={stats.currentMonthName} />
          </div>
        }
      />

      {/* Quick Stats Grid */}
      <Grid cols={6} className="mb-8">
        <StatCard 
          title="Staff" 
          label="Total Staff" 
          value={stats.totalStaff} 
          icon={<Users className="w-8 h-8 opacity-20" />}
          className="animate-fade-in"
        />
        <StatCard 
          title="Encash" 
          label="Encashments" 
          value={stats.totalEncashments} 
          icon={<IndianRupee className="w-8 h-8 text-emerald-500 opacity-20" />}
          className="animate-fade-in"
          change={{ value: "Days", trend: "up" }}
        />
        <StatCard 
          title="Lates" 
          label="Total Late" 
          value={stats.totalLates} 
          icon={<Clock className="w-8 h-8 text-amber-500 opacity-20" />}
          className="animate-fade-in"
          change={{ value: "Punches", trend: "down" }}
        />
        <StatCard 
          title="LWP" 
          label="Total LWP" 
          value={stats.totalLwp} 
          icon={<FileText className="w-8 h-8 text-rose-500 opacity-20" />}
          className="animate-fade-in"
          change={{ value: "Days", trend: "neutral" }}
        />
        <StatCard 
          title="Allowance" 
          label="Allowance" 
          value={stats.totalAllowances} 
          icon={<MapPin className="w-8 h-8 text-blue-500 opacity-20" />}
          className="animate-fade-in"
          change={{ value: "Days", trend: "up" }}
        />
        <Link href={`/dashboard/accountant/location-logs?m=${stats.currentMonth}&y=${stats.currentYear}`} className="block h-full group">
          <StatCard 
            title="Out-Office" 
            label="Out-Office" 
            value={reportData.reduce((acc, curr) => acc + curr.offSiteCount, 0)} 
            icon={<MapPin className="w-8 h-8 text-rose-500 opacity-20 group-hover:opacity-40 transition-opacity" />}
            className="animate-fade-in border-rose-500/20 bg-rose-500/5 hover-lift"
            change={{ value: "Punches", trend: "neutral" }}
          />
        </Link>
      </Grid>

      {/* Main Report Section */}
      <PageSection
        title="Master Attendance & Leave Report"
        description="Consolidated data required for end-of-month salary calculations."
        className="mb-8 animate-fade-in-up"
        noPadding
      >
        <div className="p-4">
          <MasterReportTable
            data={reportData}
            month={stats.currentMonth}
            year={stats.currentYear}
          />
        </div>
      </PageSection>

      {/* Approvals & Maintenance Section */}
      <PageSection
        title="Recent Approvals & History"
        description="Review and manage recently approved leaves to prevent double-counting in payroll."
        className="animate-fade-in-up"
        noPadding
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Employee</TableHead>
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Duration</TableHead>
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Allowance Category</TableHead>
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Processing Detail</TableHead>
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-right">Processed On</TableHead>
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-right w-10">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApprovals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <FileText className="size-10 mb-2" />
                      <p className="text-sm font-bold uppercase tracking-widest">No Recent Approvals</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recentApprovals.map((req: any) => (
                  <TableRow key={req.id} className="hover:bg-muted/5 transition-colors border-b border-border/40 last:border-0">
                    <TableCell className="py-4 px-6">
                      <div className="font-bold text-sm text-foreground">{req.employeeName}</div>
                      <div className="text-[10px] text-muted-foreground font-black mt-0.5 uppercase tracking-tighter">{req.role}</div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {req.startDate === req.endDate ? req.startDate : `${req.startDate} to ${req.endDate}`}
                        </span>
                        <div className="flex gap-1">
                          {req.duration === 'HALF' && (
                            <StatusBadge status="info" label={`HALF (${req.halfDayType === 'FIRST_HALF' ? '1st' : '2nd'})`} size="sm" withDot={false} className="font-bold" />
                          )}
                          {req.duration === 'SHORT' && (
                            <StatusBadge status="warning" label="SHORT LEAVE" size="sm" withDot={false} className="font-bold" />
                          )}
                          {req.duration === 'FULL' && (
                            <StatusBadge status="success" label="FULL DAY" size="sm" withDot={false} className="font-bold" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge variant="outline" className="font-black text-[10px] px-2 py-0.5 border-border/60 bg-muted/5 uppercase tracking-tight">
                        {req.category.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {req.systemNote ? (
                        <div className="flex items-center gap-2">
                          <StatusBadge status="success" label="Auto" size="sm" withDot={false} className="h-4 px-1" />
                          <span className="text-[11px] text-muted-foreground font-medium italic truncate max-w-[140px]" title={req.systemNote}>
                            {req.systemNote}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-bold text-muted-foreground/60 flex items-center gap-1.5">
                          <CheckCircle2 className="size-3 text-emerald-500" /> Manual Approval
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right text-xs font-mono font-bold text-muted-foreground/70">
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <CancelLeaveButton requestId={req.id} employeeName={req.employeeName} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </PageSection>
    </PageContainer>
  );
}