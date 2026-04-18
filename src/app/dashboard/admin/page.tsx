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
    <PageContainer maxWidth="full" className="py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <PageHeader
          title="Administrative Core"
          description="Real-time personnel orchestration and enterprise metrics architecture."
        />
        <div className="hidden lg:flex items-center gap-2 bg-muted/20 px-4 py-2 rounded-2xl border border-border/20">
           <Activity className="size-4 text-primary animate-pulse" />
           <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">System Health: Optimal</span>
        </div>
      </div>

      {/* Key Metrics */}
      <Grid cols={4} className="mb-10">
        <StatCard
          icon={<Users className="size-8" />}
          label="Total Identities"
          value={stats.totalEmployees}
          className="premium-card shadow-xl"
        />

        <StatCard
          icon={<CheckCircle2 className="size-8 text-emerald-500" />}
          label="Operational Today"
          value={stats.presentEmployees.length}
          className="premium-card shadow-xl"
          change={{ value: "Live", trend: "up" }}
        />

        <StatCard
          icon={<ShieldAlert className="size-8 text-rose-500" />}
          label="Critical Absences"
          value={stats.absentEmployees.length}
          className="premium-card shadow-xl"
          change={{ value: "Pending", trend: "down" }}
        />

        <StatCard
          icon={<Calendar className="size-8 text-amber-500" />}
          label="Approved Absence"
          value={stats.onLeaveEmployees.length}
          className="premium-card shadow-xl"
          change={{ value: "Valid", trend: "neutral" }}
        />
      </Grid>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Attendance Status Card */}
        <div className="premium-card shadow-xl border-border/40 overflow-hidden flex flex-col">
          <div className="px-6 py-5 bg-primary/[0.02] border-b border-border/40 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                   <Activity className="size-5" />
                </div>
                <div className="flex flex-col">
                   <h3 className="text-sm font-black uppercase tracking-widest text-foreground leading-none mb-1">Attendance Pulse</h3>
                   <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">Live cluster monitoring</p>
                </div>
             </div>
          </div>
          <div className="p-8 space-y-8 flex-1">
            {/* Status Summary Grid */}
            <div className="grid grid-cols-3 gap-8 p-8 bg-muted/10 rounded-3xl border border-border/20 shadow-inner">
              <div className="text-center">
                <div className="text-5xl font-black text-emerald-600 tracking-tighter">{stats.presentEmployees.length}</div>
                <p className="text-[10px] font-black text-muted-foreground/60 mt-3 uppercase tracking-widest">Active</p>
              </div>
              <div className="text-center border-x border-border/40">
                <div className="text-5xl font-black text-rose-600 tracking-tighter">{stats.absentEmployees.length}</div>
                <p className="text-[10px] font-black text-muted-foreground/60 mt-3 uppercase tracking-widest">Absent</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-amber-500 tracking-tighter">{stats.onLeaveEmployees.length}</div>
                <p className="text-[10px] font-black text-muted-foreground/60 mt-3 uppercase tracking-widest">On Leave</p>
              </div>
            </div>

            {/* Detailed Lists */}
            <div className="space-y-6 max-h-[360px] overflow-y-auto pr-2 scrollbar-hide">
              {stats.onLeaveEmployees.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                    <Calendar className="size-3.5" /> Approved Departures
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {stats.onLeaveEmployees.map(e => (
                      <div key={e.id} className="flex items-center justify-between p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl group hover:bg-amber-500/[0.06] transition-all">
                        <div className="flex items-center gap-3">
                           <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-[10px]">
                              {e.name.slice(0, 2).toUpperCase()}
                           </div>
                           <span className="text-sm font-bold text-foreground">{e.name}</span>
                        </div>
                        <StatusBadge status="warning" label="Away" withDot size="sm" className="font-black uppercase text-[8px] tracking-widest" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.absentEmployees.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/20">
                  <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                    <ShieldAlert className="size-3.5" /> Pending Synchronizations
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {stats.absentEmployees.slice(0, 5).map(e => (
                      <div key={e.id} className="flex items-center justify-between p-4 bg-rose-500/[0.03] border border-rose-500/10 rounded-2xl group hover:bg-rose-500/[0.06] transition-all">
                        <div className="flex items-center gap-3">
                           <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-black text-[10px]">
                              {e.name.slice(0, 2).toUpperCase()}
                           </div>
                           <span className="text-sm font-bold text-foreground">{e.name}</span>
                        </div>
                        <StatusBadge status="error" label="Late" withDot size="sm" className="font-black uppercase text-[8px] tracking-widest" />
                      </div>
                    ))}
                    {stats.absentEmployees.length > 5 && (
                      <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest text-center py-4 italic">+{stats.absentEmployees.length - 5} More Not Synced</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leave Summary Card */}
        <div className="premium-card shadow-xl border-border/40 overflow-hidden flex flex-col">
          <div className="px-6 py-5 bg-primary/[0.02] border-b border-border/40 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                   <FileText className="size-5" />
                </div>
                <div className="flex flex-col">
                   <h3 className="text-sm font-black uppercase tracking-widest text-foreground leading-none mb-1">Monthly Utilization</h3>
                   <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">Saturation report</p>
                </div>
             </div>
          </div>
          <div className="p-8 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            {stats.monthlyLeaveSummary.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-20 italic">
                <FileText className="size-16 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Leave Vectors Detected</p>
              </div>
            ) : (
              stats.monthlyLeaveSummary.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-5 bg-muted/10 rounded-2xl border border-border/20 hover:bg-primary/[0.02] hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs group-hover:bg-primary group-hover:text-white transition-all">
                       {item.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-black text-sm text-foreground uppercase tracking-tight leading-none mb-1">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">{item.totalDays} Units Allocated</p>
                    </div>
                  </div>
                  <div>
                    {item.totalDays > 3 ? (
                      <StatusBadge status="error" label="High Usage" withDot={false} size="sm" className="font-black uppercase text-[8px] tracking-widest" />
                    ) : item.totalDays > 0 ? (
                      <StatusBadge status="success" label="On Track" withDot={false} size="sm" className="font-black uppercase text-[8px] tracking-widest" />
                    ) : (
                      <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest">Perfect Saturation</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Approvals Table Section */}
      <div className="premium-card shadow-xl border-border/40 overflow-hidden">
        <div className="px-6 py-5 bg-primary/[0.02] border-b border-border/40 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                 <CheckCircle2 className="size-5" />
              </div>
              <div className="flex flex-col">
                 <h3 className="text-sm font-black uppercase tracking-widest text-foreground leading-none mb-1">Infrastructure Approvals</h3>
                 <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">Recent valid departures</p>
              </div>
           </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-4 px-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Personnel</TableHead>
                <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Framework Vector</th>
                <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Strategy</th>
                <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Channel</th>
                <th className="py-4 px-6 text-right font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Timestamp</th>
                <th className="py-4 px-6 text-right font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Control</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentApprovals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center text-muted-foreground opacity-30 italic font-medium uppercase text-[10px] tracking-widest">
                    No approved vectors found
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentApprovals.map((req: any) => (
                  <TableRow key={req.id} className="hover:bg-primary/[0.02] transition-colors border-b border-border/10 last:border-0 group">
                    <TableCell className="py-3 px-6">
                      <div className="flex items-center gap-4">
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] group-hover:bg-primary group-hover:text-white transition-all">
                           {req.employeeName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <div className="font-bold text-sm text-foreground leading-none mb-1">{req.employeeName}</div>
                          <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{req.role}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-foreground">{req.startDate === req.endDate ? req.startDate : `${req.startDate} — ${req.endDate}`}</span>
                        {req.duration === 'HALF' && (
                          <span className="text-[8px] text-primary px-2 py-0.5 bg-primary/5 border border-primary/10 rounded-md w-fit uppercase font-black tracking-widest">Half Cycle</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-6">
                      <StatusBadge
                        status="info"
                        label={req.category.replace(/_/g, ' ')}
                        size="sm"
                        className="font-black uppercase text-[8px] tracking-widest px-3 h-6"
                      />
                    </TableCell>
                    <TableCell className="py-3 px-6">
                      {req.systemNote ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase tracking-widest bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                          <Check className="size-3" /> Autonomous
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-blue-600 font-black text-[9px] uppercase tracking-widest bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10">
                          <TrendingUp className="size-3 text-blue-500/40" /> Manual
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-6 text-right font-mono text-[10px] font-bold text-muted-foreground/60">
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-3 px-6 text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-all">
                        <CancelLeaveButton requestId={req.id} employeeName={req.employeeName} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageContainer>
  );
}
