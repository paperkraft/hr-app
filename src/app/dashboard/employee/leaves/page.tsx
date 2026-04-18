import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RequestLeaveButton } from "@/components/features/leave/request-leave-button";
import {
  PageContainer,
  PageHeader,
  Grid,
  StatCard,
  StatusBadge,
  EmptyState
} from "@/components/ui";
import { CalendarRange, History, Clock4, AlertCircle, Calendar } from "lucide-react";
import { ensureBalance } from "@/actions/leave";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

async function getLeaveData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const balances = await ensureBalance(session.user.id, currentMonth, currentYear);

  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate annual stats
  const approvedThisYear = leaves.filter(
    (r) => r.status === "APPROVED" && new Date(r.startDate).getFullYear() === currentYear
  );

  const casualTaken = approvedThisYear
    .filter((r) => r.leaveType === "CASUAL")
    .reduce((acc, r) => {
      let days = Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (r.duration === "HALF") days = 0.5 * days;
      if (r.duration === "SHORT") days = 0;
      return acc + days;
    }, 0);

  const medicalTaken = approvedThisYear
    .filter((r) => r.leaveType === "MEDICAL")
    .reduce((acc, r) => {
      let days = Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (r.duration === "HALF") days = 0.5 * days;
      return acc + days;
    }, 0);

  return {
    leaves: leaves.map(l => ({
      ...l,
      startDate: l.startDate.toISOString(),
      endDate: l.endDate.toISOString(),
      createdAt: l.createdAt.toISOString()
    })),
    stats: {
      casualTaken,
      medicalTaken,
      casualRemaining: Math.max(0, 12 - casualTaken),
      medicalRemaining: Math.max(0, 12 - medicalTaken),
      totalRequests: leaves.length,
      pendingCount: leaves.filter(l => l.status === "PENDING").length
    }
  };
}

export default async function EmployeeLeavesPage() {
  const data = await getLeaveData();
  if (!data) return null;

  const getStatusVariant = (status: string): "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "APPROVED": return "success";
      case "REJECTED": return "error";
      case "PENDING": return "warning";
      default: return "info";
    }
  };

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Leave Optimization"
        description="Monitor annual allocations and synchronize absence vectors."
        breadcrumb={<span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Framework / Leaves</span>}
        action={<RequestLeaveButton />}
      />

      {/* Stats Summary */}
      <Grid cols={4} className="mb-10">
        <StatCard
          label="Casual Allocation"
          value={data.stats.casualRemaining}
          icon={<CalendarRange className="size-8" />}
          change={{ value: `${data.stats.casualTaken} Consumed`, trend: "neutral" }}
          className="premium-card shadow-xl"
        />
        <StatCard
          label="Medical Strategy"
          value={data.stats.medicalRemaining}
          icon={<AlertCircle className="size-8 text-rose-500" />}
          change={{ value: `${data.stats.medicalTaken} Consumed`, trend: "neutral" }}
          className="premium-card shadow-xl border-rose-500/10"
        />
        <StatCard
          label="Pending Sync"
          value={data.stats.pendingCount}
          icon={<Clock4 className="size-8 text-amber-500" />}
          change={{ value: "Validating", trend: "neutral" }}
          className="premium-card shadow-xl border-amber-500/10"
        />
        <StatCard
          label="Historical Total"
          value={data.stats.totalRequests}
          icon={<History className="size-8 text-blue-500" />}
          className="premium-card shadow-xl border-blue-500/10"
        />
      </Grid>

      {/* Main Table Section */}
      <div className="premium-card shadow-xl border-border/40 overflow-hidden">
        <div className="px-6 py-5 bg-primary/2 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <History className="size-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground leading-none mb-1">Request History</h3>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">Infrastructure logs</p>
            </div>
          </div>
        </div>

        {data.leaves.length === 0 ? (
          <div className="py-24 text-center">
            <EmptyState
              title="No Logic Vectors Found"
              description="Your leave history registry is currently unprovisioned."
              icon={Calendar}
            />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-collapse">
              <thead className="bg-muted/5 border-b border-border/40">
                <tr>
                  <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em] w-[220px]">Timeline</th>
                  <th className="py-4 px-6 text-center font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Duration</th>
                  <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Framework Channel</th>
                  <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Metadata</th>
                  <th className="py-4 px-6 text-right font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Protocol Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {data.leaves.map((leave) => {
                  const start = new Date(leave.startDate);
                  const end = new Date(leave.endDate);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={leave.id} className="hover:bg-primary/2 transition-colors border-b border-border/10 last:border-0 group">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-4">
                          <div className="size-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 border border-primary/10 shadow-sm">
                            <CalendarRange className="size-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-foreground leading-tight">
                              {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            {start.getTime() !== end.getTime() && (
                              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tight opacity-60 mt-1">
                                — {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black bg-muted/20 px-3 py-1.5 rounded-xl border border-border/20 uppercase tracking-widest leading-none mb-1">
                            {leave.duration}
                          </span>
                          <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">{days} {days === 1 ? 'Unit' : 'Units'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-black text-foreground uppercase tracking-tight leading-none mb-1">
                            {leave.category === "MONTHLY_POLICY_1" ? "Monthly Policy" : leave.category === "UNPAID" ? "Unpaid Base" : "Semi-Annual Framework"}
                          </span>
                          {leave.leaveType && (
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "size-1.5 rounded-full shadow-sm",
                                leave.leaveType === "CASUAL" ? "bg-primary" : "bg-rose-500"
                              )} />
                              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                                {leave.leaveType} STRATEGY
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6 max-w-[280px]">
                        <p className="text-[10px] font-medium text-muted-foreground line-clamp-1 italic opacity-80" title={leave.reason || "N/A"}>
                          "{leave.reason || "Standard operational requirement"}"
                        </p>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex justify-end">
                          <StatusBadge
                            status={getStatusVariant(leave.status)}
                            label={leave.status}
                            size="sm"
                            withDot={true}
                            className="font-black uppercase tracking-widest px-4 h-7 shadow-sm border-transparent"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
