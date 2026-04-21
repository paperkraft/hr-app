import { Users, FileText, Activity, CheckCircle2, Calendar, Clock } from "lucide-react";
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Pulse (8/12) */}
        <div className="lg:col-span-8">
          <div className="bg-card border border-border rounded-sm overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Attendance Pulse</h3>
                <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Live cluster monitoring</p>
              </div>
              <Activity className="size-4 text-muted-foreground/80" />
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

            {stats.absentEmployees.length > 0 && (
              <div className="border-t border-border/30 p-5 space-y-2">
                <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest mb-3">Unaccounted Today</p>
                {stats.absentEmployees.slice(0, 3).map(e => (
                  <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-sm bg-rose-500/2 border border-rose-500/10 group hover:border-rose-500/20 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-sm bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-[9px]">
                        {e.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-foreground/80">{e.name}</span>
                    </div>
                    <span className="text-[9px] font-black text-rose-500/70 uppercase tracking-widest">Missing</span>
                  </div>
                ))}
                {stats.absentEmployees.length > 3 && (
                  <p className="text-[9px] text-muted-foreground/40 font-bold text-center pt-1">+{stats.absentEmployees.length - 3} more</p>
                )}
              </div>
            )}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Saturation Trends (4/12) */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-sm overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Saturation Trends</h3>
                <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Utilization Index</p>
              </div>
              <FileText className="size-4 text-muted-foreground/80" />
            </div>

            <div className="divide-y divide-border/20 max-h-[350px] overflow-y-auto scrollbar-hide">
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
