import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, Activity, ShieldAlert, CheckCircle2, Check, TrendingUp, Calendar, Briefcase } from "lucide-react";
import prisma from "@/lib/prisma";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getTodayRange } from "@/lib/attendance-helper";
import { CancelLeaveButton } from "@/components/features/leave/cancel-leave-button";
import {
  PageContainer,
  PageHeader,
  PageSection,
  Grid,
  StatCard,
  StatusBadge,
  Divider,
} from "@/components/ui";

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

  const { start: today, end: tomorrow } = getTodayRange();

  // Fetch all staff with their leaves for the month
  const staff = await prisma.user.findMany({
    where: { role: { in: ["EMPLOYEE", "ACCOUNTANT"] } },
    include: {
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { gte: startOfMonth, lte: endOfMonth }
        }
      }
    }
  });

  // Fetch today's attendance using standardized range
  const todayAttendance = await prisma.attendance.findMany({
    where: {
      date: { gte: today, lte: tomorrow }
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

  // Fetch recent APPROVED requests (last 20)
  const recentApprovals = await prisma.leaveRequest.findMany({
    where: { status: "APPROVED" },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 20
  });

  return {
    totalEmployees,
    pendingLeavesSystemWide: allPendingRequests.length,
    attendanceRate: `${attendanceRate}%`,
    presentEmployees: presentEmployees.map(e => ({ id: e.id, name: e.name || e.email, role: e.role })),
    absentEmployees: absentEmployees.map(e => ({ id: e.id, name: e.name || e.email, role: e.role })),
    onLeaveEmployees: onLeaveEmployees.map(e => {
      const leave = todayLeaves.find(l => l.userId === e.id);
      return {
        id: e.id,
        name: e.name || e.email,
        role: e.role,
        category: leave?.category,
        reason: leave?.reason
      };
    }),
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
    recentActivity: [
      { id: 1, action: "Attendance System Synced", details: `${presentEmployees.length} present, ${absentEmployees.length} absent today`, time: "Just now", type: "system" },
      { id: 2, action: "Leave Policy Update", details: "Policy 2 (Semi-annual) now enforces 3-day minimum", time: "1 day ago", type: "policy" },
    ]
  };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <PageContainer maxWidth="full" className="py-8">
      {/* Header */}
      <PageHeader
        title="System Overview"
        description="Real-time administration and key metrics"
      />

      {/* Key Metrics */}
      <Grid cols={4} className="mb-8">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          label="Total Employees"
          value={stats.totalEmployees}
          className="animate-fade-in"
        />

        <StatCard
          icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          label="Present Today"
          value={stats.presentEmployees.length}
          className="animate-fade-in"
          change={{ value: "Active", trend: "up" }}
        />

        <StatCard
          icon={<ShieldAlert className="w-8 h-8 text-rose-500" />}
          label="Absent Today"
          value={stats.absentEmployees.length}
          className="animate-fade-in"
          change={{ value: "Check", trend: "down" }}
        />

        <StatCard
          icon={<Calendar className="w-8 h-8 text-amber-500" />}
          label="On Leave Today"
          value={stats.onLeaveEmployees.length}
          className="animate-fade-in"
          change={{ value: "Approved", trend: "neutral" }}
        />
      </Grid>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Attendance Status Card */}
        <PageSection
          title="Attendance Status"
          description="Real-time headcount overview"
          className="animate-fade-in-up"
        >
          <div className="space-y-6">
            {/* Status Summary Grid */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-muted/10 rounded-xl border border-border/40">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600">{stats.presentEmployees.length}</div>
                <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">Present</p>
              </div>
              <div className="flex justify-center items-center">
                <Divider vertical className="h-12" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-rose-600">{stats.absentEmployees.length}</div>
                <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">Absent</p>
              </div>
              <div className="flex justify-center items-center">
                <Divider vertical className="h-12" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-600">{stats.onLeaveEmployees.length}</div>
                <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">On Leave</p>
              </div>
            </div>

            {/* Detailed Lists */}
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {stats.onLeaveEmployees.length > 0 && (
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/20 rounded-xl">
                  <h4 className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Currently On Leave
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {stats.onLeaveEmployees.map(e => (
                      <div key={e.id} className="flex items-center justify-between p-3 bg-white/80 dark:bg-background/40 rounded-lg shadow-sm border border-amber-100 dark:border-amber-900/30">
                        <span className="text-sm font-semibold">{e.name}</span>
                        <StatusBadge status="warning" label="Away" withDot={false} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.absentEmployees.length > 0 && (
                <div className="p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/20 rounded-xl">
                  <h4 className="text-[10px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5" /> Still Not In
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {stats.absentEmployees.slice(0, 5).map(e => (
                      <div key={e.id} className="flex items-center justify-between p-3 bg-white/80 dark:bg-background/40 rounded-lg shadow-sm border border-rose-100 dark:border-rose-900/30">
                        <span className="text-sm font-semibold">{e.name}</span>
                        <StatusBadge status="error" label="Pending" withDot={false} size="sm" />
                      </div>
                    ))}
                    {stats.absentEmployees.length > 5 && (
                      <p className="text-[10px] text-muted-foreground italic text-center py-2 font-medium">+{stats.absentEmployees.length - 5} more absent</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </PageSection>

        {/* Leave Summary Card */}
        <PageSection
          title="Monthly Leave Summary"
          description="Total days taken this month"
          className="animate-fade-in-up"
        >
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.monthlyLeaveSummary.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-40">
                <FileText className="w-12 h-12 mb-4" />
                <p className="text-sm font-medium italic">No leave data available</p>
              </div>
            ) : (
              stats.monthlyLeaveSummary.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-muted/5 rounded-xl border border-border/40 hover:bg-muted/10 transition-all duration-200 group">
                  <div className="flex-1">
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">{item.totalDays} {item.totalDays === 1 ? 'day' : 'days'} taken</p>
                  </div>
                  <div>
                    {item.totalDays > 3 ? (
                      <StatusBadge status="error" label="High Usage" withDot={false} size="sm" />
                    ) : item.totalDays > 0 ? (
                      <StatusBadge status="success" label="On Track" withDot={false} size="sm" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Perfect record</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </PageSection>
      </div>

      {/* Recent Approvals Table Section */}
      <PageSection
        title="Recent Leave Approvals"
        description="Processed leave requests and auto-approvals"
        className="animate-fade-in-up"
      >
        <div className="border border-border/40 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Employee</TableHead>
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Duration</TableHead>
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Type</TableHead>
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Method</TableHead>
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-right">Processed</TableHead>
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-right w-10">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentApprovals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground opacity-50 italic font-medium">
                      No approval history found
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentApprovals.map((req: any) => (
                    <TableRow key={req.id} className="hover:bg-muted/5 transition-colors border-b border-border/40 last:border-0">
                      <TableCell className="py-4 px-6">
                        <div className="font-bold text-sm text-foreground">{req.employeeName}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">{req.role}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-xs font-semibold">
                        <div className="flex flex-col gap-1">
                          <span>{req.startDate === req.endDate ? req.startDate : `${req.startDate} to ${req.endDate}`}</span>
                          {req.duration === 'HALF' && (
                            <span className="text-[9px] text-primary px-1.5 py-0.5 bg-primary/10 rounded w-fit uppercase font-bold tracking-tighter">Half Day</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <StatusBadge
                          status="info"
                          label={req.category.replace(/_/g, ' ')}
                          size="sm"
                          className="font-bold py-1 px-3"
                        />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {req.systemNote ? (
                          <Badge variant="outline" className="bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30 font-bold text-[10px] px-2 py-0.5">
                            Auto
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30 font-bold text-[10px] px-2 py-0.5">
                            Manual
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right text-xs font-mono font-medium text-muted-foreground">
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
        </div>
      </PageSection>
    </PageContainer>
  );
}
