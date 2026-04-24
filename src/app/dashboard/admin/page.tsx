import { Users, FileText, Activity, CheckCircle2, Calendar, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageContainer, StatCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import { UpcomingMilestones } from "@/components/features/dashboard/upcoming-milestones";
import { TeamOnLeave } from "@/components/features/dashboard/team-on-leave";
import { CommunicationHub } from "@/components/features/dashboard/communication-hub";
import { getAdminDashboardStats } from "@/actions/dashboard";

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const result = await getAdminDashboardStats();
  if (!result.success) return <div>Error loading stats</div>;
  const stats = result.data;
  const totalStaff = stats.presentEmployees.length + stats.absentEmployees.length + stats.onLeaveEmployees.length;

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Admin Overview</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Real-time workforce and leave management</p>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees"
          value={stats.totalEmployees}
          subValue="Active workforce"
          icon={<Users className="size-4" />}
          progress={100}
          progressColor="bg-primary"
        />
        <StatCard
          label="Present Today"
          value={stats.presentEmployees.length}
          subValue={`${stats.attendanceRate}% attendance rate`}
          icon={<CheckCircle2 className="size-4" />}
          progress={stats.attendanceRate}
          progressColor="bg-emerald-500"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingCount}
          subValue="Awaiting approval"
          icon={<Clock className="size-4" />}
          progress={stats.pendingCount > 0 ? Math.min(stats.pendingCount * 10, 100) : 0}
          progressColor="bg-amber-500"
        />
        <StatCard
          label="On Leave Today"
          value={stats.onLeaveEmployees.length}
          subValue="Approved absences"
          icon={<Calendar className="size-4" />}
          progress={totalStaff > 0 ? Math.round((stats.onLeaveEmployees.length / totalStaff) * 100) : 0}
          progressColor="bg-sky-500"
        />
      </div>

      {/* ROW 1: Attendance Pulse & Communication Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Attendance Pulse (8/12) */}
        <div className="lg:col-span-8">
          <div className="bg-card border border-border rounded-sm overflow-hidden h-[430px] flex flex-col">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Attendance Pulse</h3>
                <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Live cluster monitoring</p>
              </div>
              <Link
                href="/dashboard/admin/attendance"
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors bg-primary/5 px-2 py-1 rounded-sm border border-primary/10"
              >
                View Detailed Pulse
                <ArrowUpRight className="size-3" />
              </Link>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border/30">
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-emerald-600 tabular-nums mb-1">{stats.presentEmployees.length}</div>
                <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest">Active</p>
                <div className="mt-3 h-1 bg-muted/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalStaff > 0 ? (stats.presentEmployees.length / totalStaff) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-rose-500 tabular-nums mb-1">{stats.absentEmployees.length}</div>
                <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest">Absent</p>
                <div className="mt-3 h-1 bg-muted/20 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${totalStaff > 0 ? (stats.absentEmployees.length / totalStaff) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-amber-500 tabular-nums mb-1">{stats.onLeaveEmployees.length}</div>
                <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest">On Leave</p>
                <div className="mt-3 h-1 bg-muted/20 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalStaff > 0 ? (stats.onLeaveEmployees.length / totalStaff) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="border-t border-border/30 p-5 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Workforce Status</p>
                <span className="text-[9px] font-bold text-muted-foreground/40 tabular-nums">{totalStaff} Total Staff</span>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide -mx-1 px-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border/40">
                      <th className="pb-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest bg-card">Employee</th>
                      <th className="pb-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest bg-card">Department</th>
                      <th className="pb-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest text-right bg-card">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {[
                      ...stats.presentEmployees.map(e => ({ ...e, status: 'Present', color: 'text-emerald-600 bg-emerald-500/10' })),
                      ...stats.onLeaveEmployees.map(e => ({ ...e, status: 'On Leave', color: 'text-amber-600 bg-amber-500/10' })),
                      ...stats.absentEmployees.map(e => ({ ...e, status: 'Absent', color: 'text-rose-600 bg-rose-500/10' }))
                    ]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((item) => (
                        <tr key={item.id} className="group hover:bg-muted/5 transition-colors">
                          <td className="py-2.5">
                            <span className="text-[11px] font-bold text-foreground/80">{item.name}</span>
                          </td>
                          <td className="py-2.5">
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">{(item as any).department || "N/A"}</span>
                          </td>
                          <td className="py-2.5 text-right">
                            <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter border border-border/10", item.color)}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <Link
                href="/dashboard/admin/attendance"
                className="mt-2 flex items-center justify-center gap-1.5 w-full text-[10px] font-black text-primary uppercase tracking-widest py-2.5 bg-primary/5 border-t border-border/40 hover:bg-primary/10 transition-all shrink-0"
              >
                View Full Workforce Pulse
                <ArrowUpRight className="size-3" />
              </Link>
            </div>

          </div>
        </div>

        {/* Communication Hub (4/12) */}
        <div className="lg:col-span-4">
          <CommunicationHub
            announcements={stats.announcements}
            notifications={stats.notifications}
          />
        </div>
      </div>

      {/* ROW 2: Operational Visibility Cluster (Saturation, Milestones, Team) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Saturation Trends (4/12) */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-sm overflow-hidden h-[430px] flex flex-col">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Saturation Trends</h3>
                <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Utilization Index</p>
              </div>
              <FileText className="size-4 text-muted-foreground/80" />
            </div>

            <div className="divide-y divide-border/20 flex-1 overflow-y-auto scrollbar-hide">
              {stats.monthlyLeaveSummary.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center gap-2 opacity-20">
                  <FileText className="size-6" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No data mapped</p>
                </div>
              ) : (
                stats.monthlyLeaveSummary.slice(0, 8).map((item) => (
                  <div key={item.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-muted/5 transition-colors group">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="size-8 rounded-sm bg-muted text-foreground/40 flex items-center justify-center font-bold text-[10px] border border-border/40 group-hover:bg-primary/5 group-hover:text-primary transition-colors shrink-0">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-foreground truncate">{item.name}</p>
                        <div className="mt-1.5 h-1.5 bg-muted/40 rounded-full overflow-hidden w-full">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", item.totalDays > 3 ? "bg-rose-500" : item.totalDays > 0 ? "bg-emerald-500" : "bg-muted/50")}
                            style={{ width: `${Math.min((item.totalDays / 5) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right min-w-[50px]">
                      <span className="text-[12px] font-bold text-foreground/70 tabular-nums">{item.totalDays}d</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Milestones (4/12) */}
        <div className="lg:col-span-4">
          <UpcomingMilestones
            holidays={stats.holidays || []}
            nextBirthday={stats.nextBirthday}
            nextAnniversary={stats.nextAnniversary}
          />
        </div>

        {/* Team On Leave (4/12) */}
        <div className="lg:col-span-4">
          <TeamOnLeave members={stats.teamOnLeave} />
        </div>
      </div>

    </PageContainer>
  );
}
