import { getAdminDashboardStats } from "@/actions/dashboard";
import { PageContainer } from "@/components/ui";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  Activity
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DailyAttendancePage() {
  const result = await getAdminDashboardStats();
  if (!result.success || !result.data) return <div>Error loading stats</div>;
  const stats = result.data;

  const formatTime = (date: Date | string | null) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            Daily Attendance Pulse
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Consolidated workforce status for {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <Tabs defaultValue="present" className="w-full">
        <TabsList className="bg-muted/10 p-1 border border-border/40 mb-6">
          <TabsTrigger value="present" className="flex items-center gap-2 px-6">
            <CheckCircle2 className="size-3.5" />
            <span>Present</span>
            <span className="ml-1 bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full text-[10px] font-black">
              {stats.presentEmployees.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="on-leave" className="flex items-center gap-2 px-6">
            <Calendar className="size-3.5" />
            <span>On Leave</span>
            <span className="ml-1 bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-full text-[10px] font-black">
              {stats.onLeaveEmployees.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="absent" className="flex items-center gap-2 px-6">
            <XCircle className="size-3.5" />
            <span>Absent</span>
            <span className="ml-1 bg-rose-500/10 text-rose-600 px-1.5 py-0.5 rounded-full text-[10px] font-black">
              {stats.absentEmployees.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Present Employees Content */}
        <TabsContent value="present" className="animate-in fade-in-50 duration-500">
          <div className="bg-card border border-border/60 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/5">
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Employee</th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Department</th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">In Time</th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest text-right">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {stats.presentEmployees.map((e) => (
                  <tr key={e.id} className="group hover:bg-muted/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-sm bg-primary/5 text-primary flex items-center justify-center font-bold text-[10px] border border-primary/10">
                          {e.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[12px] font-bold text-foreground/80">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tight">{(e as any).department}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-foreground tabular-nums font-black text-[11px]">
                        <Clock className="size-3 text-muted-foreground/40" />
                        {formatTime((e as any).punchIn)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {(e as any).isOutsideOffice ? (
                        <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-sm uppercase tracking-widest border border-amber-500/20">Off-site</span>
                      ) : (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-sm uppercase tracking-widest border border-emerald-500/20">On-site</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* On Leave Employees Content */}
        <TabsContent value="on-leave" className="animate-in fade-in-50 duration-500">
          <div className="bg-card border border-border/60 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/5">
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Employee</th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Department</th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Type</th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Duration</th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest text-right">Date Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {stats.onLeaveEmployees.map((e) => (
                  <tr key={e.id} className="group hover:bg-muted/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-sm bg-amber-500/5 text-amber-600 flex items-center justify-center font-bold text-[10px] border border-amber-500/10">
                          {e.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[12px] font-bold text-foreground/80">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tight">{(e as any).department}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-sm uppercase tracking-widest border border-amber-500/20">
                        {(e as any).leaveType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{(e as any).duration}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[11px] font-black text-foreground uppercase tabular-nums">
                        {new Date((e as any).startDate).toDateString() === new Date((e as any).endDate).toDateString() ? (
                          new Date((e as any).startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        ) : (
                          `${new Date((e as any).startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${new Date((e as any).endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.onLeaveEmployees.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center gap-2 opacity-20">
                <Calendar className="size-10" />
                <p className="text-xs font-black uppercase tracking-widest">No employees on leave today</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Absent Employees Content */}
        <TabsContent value="absent" className="animate-in fade-in-50 duration-500">
          <div className="bg-card border border-border/60 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/5">
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Employee</th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Department</th>
                  <th className="px-5 py-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {stats.absentEmployees.map((e) => (
                  <tr key={e.id} className="group hover:bg-muted/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-sm bg-rose-500/5 text-rose-500 flex items-center justify-center font-bold text-[10px] border border-rose-500/10">
                          {e.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[12px] font-bold text-foreground/80">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tight">{(e as any).department}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-sm uppercase tracking-widest border border-rose-500/20">
                        Absent
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.absentEmployees.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center gap-2 opacity-20">
                <CheckCircle2 className="size-10" />
                <p className="text-xs font-black uppercase tracking-widest">Everyone is accounted for today!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
