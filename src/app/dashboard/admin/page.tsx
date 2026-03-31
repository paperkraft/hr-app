import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, Activity, ShieldAlert, CheckCircle2, Check } from "lucide-react";
import prisma from "@/lib/prisma";
import { LeaveApprovalRow } from "@/components/features/manager/leave-approval-row";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

function getDaysDifference(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
}

async function getAdminStats() {
  const totalEmployees = await prisma.user.count();

  // Fetch ALL pending requests across the entire system
  const allPendingRequests = await prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch all staff with their leaves for the month
  const staff = await prisma.user.findMany({
    where: { role: { in: ["EMPLOYEE", "MANAGER", "ACCOUNTANT"] } },
    include: {
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { gte: startOfMonth, lte: endOfMonth }
        }
      }
    }
  });

  // Fetch today's attendance
  const todayAttendance = await prisma.attendance.findMany({
    where: {
      date: { gte: today, lt: tomorrow }
    }
  });

  // Fetch today's approved leaves
  const todayLeaves = await prisma.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: today },
      endDate: { gte: today }
    },
    include: { user: true }
  });

  const presentIds = new Set(todayAttendance.map(a => a.userId));
  const onLeaveIds = new Set(todayLeaves.map(l => l.userId));

  const presentEmployees = staff.filter(s => presentIds.has(s.id));
  const onLeaveEmployees = staff.filter(s => onLeaveIds.has(s.id) && !presentIds.has(s.id));
  const absentEmployees = staff.filter(s => !presentIds.has(s.id) && !onLeaveIds.has(s.id));

  const attendanceRate = staff.length > 0 ? Math.round((presentEmployees.length / staff.length) * 100) : 100;

  return {
    totalEmployees,
    pendingLeavesSystemWide: allPendingRequests.length,
    attendanceRate: `${attendanceRate}%`,
    presentEmployees: presentEmployees.map(e => ({ id: e.id, name: e.name || e.email, role: e.role })),
    absentEmployees: absentEmployees.map(e => ({ id: e.id, name: e.name || e.email, role: e.role })),
    onLeaveEmployees: onLeaveEmployees.map(e => ({ id: e.id, name: e.name || e.email, role: e.role })),
    monthlyLeaveSummary: staff.map(s => {
      let totalDays = 0;
      s.leaveRequests.forEach(req => {
        const diff = getDaysDifference(req.startDate, req.endDate);
        totalDays += req.duration === "HALF" ? diff * 0.5 : diff;
      });
      return {
        id: s.id,
        name: s.name || s.email,
        totalDays
      };
    }).sort((a, b) => b.totalDays - a.totalDays), // Sort by most leaves taken
    allPendingRequests: allPendingRequests.map((req: any) => ({
      id: req.id,
      employeeName: `${req.user.name || req.user.email} (${req.user.role})`,
      startDate: new Date(req.startDate).toISOString().split('T')[0],
      endDate: new Date(req.endDate).toISOString().split('T')[0],
      duration: req.duration,
      category: req.category,
      reason: req.reason || "No reason provided",
      startTime: req.startTime,
      endTime: req.endTime,
    })),
    recentActivity: [
      { id: 1, action: "Attendance System Synced", details: `${presentEmployees.length} present, ${absentEmployees.length} absent today`, time: "Just now", type: "system" },
      { id: 2, action: "Leave Policy Update", details: "Policy 2 (Semi-annual) now enforces 3-day minimum", time: "1 day ago", type: "policy" },
    ]
  };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground mt-1">High-level administration and system metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Active across all departments</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="size-4 text-amber-500" />
              Pending Leaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.pendingLeavesSystemWide}</div>
            <p className="text-xs text-muted-foreground mt-1">System-wide awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats.attendanceRate}</div>
            <p className="text-xs text-muted-foreground mt-1">Punched in on time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="shadow-sm border-border/40 p-0 gap-0">
          <CardHeader className="bg-muted/5 border-b border-border/40 p-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              Today's Attendance Status
            </CardTitle>
            <CardDescription>Real-time headcount as of today.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{stats.presentEmployees.length}</div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Present</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-rose-600">{stats.absentEmployees.length}</div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Absent</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.onLeaveEmployees.length}</div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">On Leave</div>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {stats.absentEmployees.length > 0 && (
                <div className="p-4 border-b border-border/40 bg-rose-50/30">
                  <h3 className="text-xs font-bold text-rose-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldAlert className="size-3" /> Still Not In
                  </h3>
                  <div className="space-y-2">
                    {stats.absentEmployees.map(e => (
                      <div key={e.id} className="flex items-center justify-between bg-card p-2 rounded border border-rose-200/50 shadow-sm">
                        <span className="text-sm font-medium">{e.name}</span>
                        <Badge variant="outline" className="text-[9px] uppercase">{e.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Present Staff</h3>
                {stats.presentEmployees.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No one has punched in yet today.</p>
                ) : (
                  <div className="space-y-2">
                    {stats.presentEmployees.map(e => (
                      <div key={e.id} className="flex items-center justify-between p-2 rounded border border-border/40 bg-muted/10">
                        <span className="text-sm">{e.name}</span>
                        <Badge variant="secondary" className="text-[9px] uppercase">{e.role}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Leave Summary Card */}
        <Card className="shadow-sm border-border/40 p-0 gap-0">
          <CardHeader className="bg-muted/5 border-b border-border/40 p-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Monthly Leave Summary
            </CardTitle>
            <CardDescription>Total days on leave for this month.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="py-3 px-4">Employee</TableHead>
                  <TableHead className="py-3 px-4 text-center">Days Taken</TableHead>
                  <TableHead className="py-3 px-4 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.monthlyLeaveSummary.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/10">
                    <TableCell className="py-3 px-4 font-medium">{item.name}</TableCell>
                    <TableCell className="py-3 px-4 text-center font-bold">
                      {item.totalDays} {item.totalDays === 1 ? 'day' : 'days'}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right">
                      {item.totalDays > 3 ? (
                        <Badge variant="outline" className="text-amber-600 bg-amber-50">High Usage</Badge>
                      ) : item.totalDays > 0 ? (
                        <Badge variant="outline" className="text-emerald-600 bg-emerald-50">Normal</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">No leaves</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/40 p-0 gap-0">
        <CardHeader className="bg-muted/5 border-b border-border/40 p-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="size-5 text-amber-500" />
            Pending Approvals
          </CardTitle>
          <CardDescription>Leaves requiring system-wide review.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {stats.allPendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mb-4 text-muted/20" />
              <p className="text-sm font-medium">All clear! No pending requests.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="py-3 px-4">Employee</TableHead>
                  <TableHead className="py-3 px-4">Dates</TableHead>
                  <TableHead className="py-3 px-4">Reason</TableHead>
                  <TableHead className="py-3 px-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.allPendingRequests.map((req: any) => (
                  <LeaveApprovalRow key={req.id} request={req} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card >

    </div >
  );
}