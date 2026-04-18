import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RequestLeaveButton } from "@/components/features/leave/request-leave-button";
import {
  PageContainer,
  StatCard,
} from "@/components/ui";
import { CalendarRange, History, Clock4, AlertCircle, Calendar, MessageSquare } from "lucide-react";
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
      startDate: l.startDate,
      endDate: l.endDate,
      createdAt: l.createdAt
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

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">My Leaves</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your leave applications and track balance history</p>
        </div>
        <RequestLeaveButton />
      </div>

      {/* Stats Summary - High Density Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Casual Leave"
          value={`${data.stats.casualRemaining} days`}
          subValue={`${data.stats.casualTaken} days consumed`}
          icon={<CalendarRange className="size-4" />}
          progress={Math.round((data.stats.casualTaken / 12) * 100)}
          progressColor="bg-primary"
        />
        <StatCard
          label="Sick Leave"
          value={`${data.stats.medicalRemaining} days`}
          subValue={`${data.stats.medicalTaken} days consumed`}
          icon={<AlertCircle className="size-4" />}
          progress={Math.round((data.stats.medicalTaken / 12) * 100)}
          progressColor="bg-rose-500"
        />
        <StatCard
          label="Pending Sync"
          value={data.stats.pendingCount}
          subValue="Awaiting approval"
          icon={<Clock4 className="size-4" />}
          progress={data.stats.pendingCount > 0 ? 50 : 0}
          progressColor="bg-amber-500"
        />
        <StatCard
          label="Total History"
          value={data.stats.totalRequests}
          subValue="Life-time requests"
          icon={<History className="size-4" />}
          progress={100}
          progressColor="bg-blue-500"
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-border/60 rounded-sm shadow-sm overflow-hidden animate-fade-in">
        <div className="px-5 py-4 border-b border-border/40 bg-muted/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">Leave History</h3>
            <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">Complete record of applications</p>
          </div>
        </div>

        {data.leaves.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2 opacity-20">
            <Calendar className="size-7" />
            <p className="text-[10px] font-black uppercase tracking-widest">No history found</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-collapse">
              <thead className="bg-muted/5 border-b border-border/40">
                <tr>
                  <th className="py-3 px-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 w-[200px]">Timeline</th>
                  <th className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Duration</th>
                  <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Type</th>
                  <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Reason</th>
                  <th className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {data.leaves.map((leave) => {
                  const start = new Date(leave.startDate);
                  const end = new Date(leave.endDate);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={leave.id} className="hover:bg-muted/5 transition-colors group">
                      {/* Timeline */}
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                            <CalendarRange className="size-3.5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-foreground leading-none">
                              {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            {start.getTime() !== end.getTime() && (
                              <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tight mt-0.5">
                                — {end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest bg-muted/20 px-2 py-0.5 rounded-sm border border-border/20 mb-0.5">
                            {leave.duration === "FULL" ? "Full day" : leave.duration === "HALF" ? "Half day" : "Short"}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground/40 tabular-nums">
                            {days} {days === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-foreground/70 uppercase tracking-tight">
                            {leave.leaveType === "CASUAL" ? "Casual Leave" : "Sick Leave"}
                          </span>
                          <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest mt-0.5">
                            {leave.category === "MONTHLY_POLICY_1" ? "Monthly" : leave.category === "UNPAID" ? "Unpaid" : "Policy"}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="flex items-start gap-1.5 group/reason">
                          <MessageSquare className="size-3 text-muted-foreground/20 mt-0.5" />
                          <p className="text-[10px] font-medium text-muted-foreground/60 leading-snug line-clamp-2 italic" title={leave.reason || ""}>
                            {leave.reason || "No reason specified"}
                          </p>
                        </div>
                      </td>

                      {/* Status - Plain text with dot */}
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className={cn(
                            "size-1.5 rounded-full",
                            leave.status === "APPROVED" && "bg-emerald-500",
                            leave.status === "REJECTED" && "bg-rose-500",
                            leave.status === "PENDING" && "bg-amber-500 animate-pulse"
                          )} />
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            leave.status === "APPROVED" && "text-emerald-600",
                            leave.status === "REJECTED" && "text-rose-600",
                            leave.status === "PENDING" && "text-amber-600"
                          )}>
                            {leave.status}
                          </span>
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
