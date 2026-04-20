import { Users, FileText, Activity, ShieldAlert, CheckCircle2, Check, TrendingUp, Calendar, Clock, ArrowRight } from "lucide-react";
import { CancelLeaveButton } from "@/components/features/leave/cancel-leave-button";
import { PageContainer, StatCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import { UpcomingHolidays } from "@/components/features/dashboard/upcoming-holidays";
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

      {/* Stat Cards Row — Matching Reference */}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Attendance Status (2/3 width) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Attendance Pulse */}
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Attendance Pulse</h3>
                <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Live cluster monitoring</p>
              </div>
              <Activity className="size-4 text-muted-foreground/80" />
            </div>

            {/* 3-column metric strip */}
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

            {/* Employee lists */}
            {(stats.onLeaveEmployees.length > 0 || stats.absentEmployees.length > 0) && (
              <div className="border-t border-border/30">
                {stats.onLeaveEmployees.length > 0 && (
                  <div className="p-5 space-y-2">
                    <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-3">On Leave Today</p>
                    {stats.onLeaveEmployees.slice(0, 4).map(e => (
                      <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-sm bg-amber-500/2 border border-amber-500/10 group hover:border-amber-500/20 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-sm bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-[9px]">
                            {e.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-foreground/80">{e.name}</span>
                        </div>
                        <span className="text-[9px] font-black text-amber-600/70 uppercase tracking-widest">Away</span>
                      </div>
                    ))}
                  </div>
                )}
                {stats.absentEmployees.length > 0 && (
                  <div className={cn("p-5 space-y-2", stats.onLeaveEmployees.length > 0 && "border-t border-border/30")}>
                    <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest mb-3">Unaccounted</p>
                    {stats.absentEmployees.slice(0, 4).map(e => (
                      <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-sm bg-rose-500/2 border border-rose-500/10 group hover:border-rose-500/20 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-sm bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-[9px]">
                            {e.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-foreground/80">{e.name}</span>
                        </div>
                        <span className="text-[9px] font-black text-rose-500/70 uppercase tracking-widest">Absent</span>
                      </div>
                    ))}
                    {stats.absentEmployees.length > 4 && (
                      <p className="text-[9px] text-muted-foreground/40 font-bold text-center pt-1">+{stats.absentEmployees.length - 4} more</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Approvals Table */}
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Recent Approvals</h3>
                <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Recent valid departures</p>
              </div>
              <CheckCircle2 className="size-4 text-muted-foreground/80" />
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full border-collapse">
                <thead className="bg-muted/5 border-b border-border/40">
                  <tr>
                    <th className="py-3 px-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Employee</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Period</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Category</th>
                    <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Channel</th>
                    <th className="py-3 px-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Date</th>
                    <th className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {stats.recentApprovals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[10px] text-muted-foreground/30 font-black uppercase tracking-widest">
                        No approved records found
                      </td>
                    </tr>
                  ) : (
                    stats.recentApprovals.map((req: any) => (
                      <tr key={req.id} className="hover:bg-muted/5 transition-colors group">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-sm bg-muted text-foreground/40 flex items-center justify-center font-bold text-[9px] border border-border/40 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                              {req.employeeName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">{req.employeeName}</div>
                              <div className="text-[9px] text-muted-foreground/50 font-bold uppercase">{req.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-bold text-foreground/70">
                            {req.startDate === req.endDate ? req.startDate : `${req.startDate} — ${req.endDate}`}
                          </span>
                          {req.duration === 'HALF' && (
                            <span className={cn(
                              "ml-1.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm",
                              req.halfDayType === "FIRST_HALF" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                            )}>
                              {req.halfDayType === "FIRST_HALF" ? "1st Half" : "2nd Half"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-black text-foreground/60 uppercase tracking-tight">
                            {req.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {req.systemNote ? (
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                              <Check className="size-2.5" /> Auto
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-sky-600/70 uppercase tracking-widest flex items-center gap-1">
                              <TrendingUp className="size-2.5" /> Manual
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[10px] font-bold text-muted-foreground/50 tabular-nums">
                            {new Date(req.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <CancelLeaveButton requestId={req.id} employeeName={req.employeeName} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Insights & Feed (1/3 width) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Combined Communication & Activity */}
          <CommunicationHub
            announcements={stats.announcements}
            notifications={stats.notifications}
          />

          {/* Upcoming Holidays */}
          <UpcomingHolidays holidays={stats.holidays || []} />
        </div>
      </div>

      {/* ACTION & REPORTING ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Pending Requests Section (1/2 width) */}
        <div className="lg:col-span-6">
          <div className="bg-card border border-border rounded-sm overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Queue Management</h3>
                <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">Pending Approvals</p>
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-sm">
                {stats.allPendingRequests.length}
              </span>
            </div>

            <div className="divide-y divide-border/20 max-h-[320px] overflow-y-auto scrollbar-hide">
              {stats.allPendingRequests.length === 0 ? (
                <div className="py-12 text-center opacity-20 flex flex-col items-center gap-2">
                  <ShieldAlert className="size-5" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Queue Clear</p>
                </div>
              ) : (
                stats.allPendingRequests.slice(0, 10).map((req: any) => (
                  <div key={req.id} className="px-5 py-3.5 flex items-start justify-between gap-3 hover:bg-muted/5 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="size-8 rounded-sm bg-muted text-foreground/40 flex items-center justify-center font-bold text-[10px] border border-border/40 shrink-0">
                        {req.employeeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-foreground truncate">{req.employeeName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase truncate mt-0.5 flex items-center gap-1.5">
                          {req.startDate} · {req.category.replace(/_/g, ' ')}
                          {req.duration === "HALF" && (
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-[2px] text-[7px] font-black tracking-normal",
                              req.halfDayType === "FIRST_HALF" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                            )}>
                              {req.halfDayType === "FIRST_HALF" ? "1H" : "2H"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase border border-amber-500/10 shrink-0">
                        Awaiting
                      </div>
                      <div className="text-[9px] font-black text-primary/40 uppercase group-hover:text-primary transition-colors flex items-center gap-1">
                        Review <ArrowRight className="size-2.5" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Monthly Utilization Section (1/2 width) */}
        <div className="lg:col-span-6">
          <div className="bg-card border border-border rounded-sm overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Saturation Trends</h3>
                <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest text-xs">Utilization Index</p>
              </div>
              <FileText className="size-4 text-muted-foreground/80" />
            </div>

            <div className="divide-y divide-border/20 max-h-[320px] overflow-y-auto scrollbar-hide">
              {stats.monthlyLeaveSummary.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center gap-2 opacity-20">
                  <FileText className="size-6" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No data mapped</p>
                </div>
              ) : (
                stats.monthlyLeaveSummary.slice(0, 10).map((item) => (
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
                      {item.totalDays > 3 ? (
                        <p className="text-[8px] font-black text-rose-500 uppercase tracking-tight">Over</p>
                      ) : item.totalDays > 0 ? (
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-tight">Active</p>
                      ) : (
                        <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-tight">Zero</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
