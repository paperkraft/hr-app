import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Users, Clock, FileText, Calculator, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

function getDaysDifference(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
}

async function getPayrollReportData() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ACCOUNTANT") {
    redirect("/dashboard/employee");
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

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

    const totalLate = attendances.filter(a => a.isLate).length;
    totalLatesSystemWide += totalLate;

    // Calculate Explicit LWP (Unpaid Leaves)
    let lwpDays = 0;
    user.leaveRequests.forEach(req => {
      if (req.category === "UNPAID") {
        const diffDays = getDaysDifference(req.startDate, req.endDate);
        const actualDays = req.duration === "HALF" ? 0.5 * diffDays : diffDays;
        lwpDays += actualDays;
      }
    });
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
      currentMonthName: now.toLocaleString('default', { month: 'long' })
    }
  };
}

export default async function AccountantDashboard() {
  const { reportData, stats } = await getPayrollReportData();

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-375 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Calculator className="w-8 h-8 text-primary" />
            Payroll & Processing
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Comprehensive attendance and leave report for {stats.currentMonthName} {new Date().getFullYear()}.
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 bg-background hover:bg-secondary">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
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
      <Card className="shadow-sm border-border/40">
        <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
          <CardTitle className="text-lg">Master Attendance & Leave Report</CardTitle>
          <CardDescription>Consolidated data required for end-of-month salary calculations.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="h-12 font-semibold text-foreground">Employee Name</TableHead>
                  <TableHead className="h-12 font-semibold text-foreground text-center">Role</TableHead>
                  <TableHead className="h-12 font-semibold text-foreground text-center">Days Present</TableHead>
                  <TableHead className="h-12 font-semibold text-foreground text-center">Late Marks</TableHead>
                  {/* New LWP Column */}
                  <TableHead className="h-12 font-semibold text-destructive bg-destructive/5 text-center">LWP (Unpaid)</TableHead>
                  <TableHead className="h-12 font-semibold text-foreground text-center border-l border-border/50">Remaining Full (Pol 1)</TableHead>
                  <TableHead className="h-12 font-semibold text-emerald-600 bg-emerald-500/5 text-center">Encashable (Pol 1)</TableHead>
                  <TableHead className="h-12 font-semibold text-foreground text-center border-l border-border/50">Remaining Short (Pol 1)</TableHead>
                  <TableHead className="h-12 font-semibold text-foreground text-right pr-6">Remaining Semi-Annual (Pol 2)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {reportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No staff data found for this month.
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-secondary/50">
                          {row.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-foreground">
                        {row.totalPresent}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.totalLate > 0 ? (
                          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
                            {row.totalLate}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* LWP Value Cell */}
                      <TableCell className="text-center font-bold text-destructive bg-destructive/5">
                        {row.lwpDays > 0 ? row.lwpDays : "0"}
                      </TableCell>

                      <TableCell className="text-center font-mono border-l border-border/50">
                        {row.balances.full}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-emerald-600 bg-emerald-500/5">
                        {row.encashableDays > 0 ? `+${row.encashableDays}` : "0"}
                      </TableCell>
                      <TableCell className="text-center font-mono border-l border-border/50">
                        {row.balances.short}
                      </TableCell>
                      <TableCell className="text-right font-mono pr-6">
                        {row.balances.semiAnnual}
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