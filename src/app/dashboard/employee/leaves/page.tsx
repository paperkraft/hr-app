import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RequestLeaveButton } from "@/components/features/leave/request-leave-button";
import { 
  PageContainer, 
  PageHeader, 
  PageSection, 
  Grid, 
  StatCard, 
  StatusBadge, 
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@/components/ui";
import { CalendarRange, History, Clock4, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { ensureBalance } from "@/actions/leave";

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
    <PageContainer maxWidth="full" className="py-8">
      {/* Header */}
      <PageHeader
        title="Leave Management"
        description="Submit and track your leave applications and annual balance."
        breadcrumb={<span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Dashboard / Leaves</span>}
        action={<RequestLeaveButton />}
      />

      {/* Stats Summary */}
      <Grid cols={4} className="mb-8">
        <StatCard
          label="Casual Balance"
          value={data.stats.casualRemaining}
          icon={<CalendarRange className="w-8 h-8 opacity-20" />}
          change={{ value: `${data.stats.casualTaken} Taken`, trend: "neutral" }}
          className="animate-fade-in"
        />
        <StatCard
          label="Sick Leave Balance"
          value={data.stats.medicalRemaining}
          icon={<AlertCircle className="w-8 h-8 text-rose-500 opacity-20" />}
          change={{ value: `${data.stats.medicalTaken} Taken`, trend: "neutral" }}
          className="animate-fade-in"
        />
        <StatCard
          label="Pending Review"
          value={data.stats.pendingCount}
          icon={<Clock4 className="w-8 h-8 text-amber-500 opacity-20" />}
          change={{ value: "Awaiting HR", trend: "neutral" }}
          className="animate-fade-in"
        />
        <StatCard
          label="Total History"
          value={data.stats.totalRequests}
          icon={<History className="w-8 h-8 text-blue-500 opacity-20" />}
          className="animate-fade-in"
        />
      </Grid>

      {/* Main Table Section */}
      <PageSection
        title="Request History"
        description="Full record of your leave applications."
        className="animate-fade-in-up"
        noPadding
      >
        {data.leaves.length === 0 ? (
          <div className="py-20">
            <EmptyState
              title="No Requests Found"
              description="You haven't submitted any leave requests yet."
              icon={Calendar}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Dates</TableHead>
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center">Duration</TableHead>
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Category</TableHead>
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Reason</TableHead>
                  <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.leaves.map((leave) => {
                  const start = new Date(leave.startDate);
                  const end = new Date(leave.endDate);
                  return (
                    <TableRow key={leave.id} className="hover:bg-muted/5 transition-colors border-b border-border/40 last:border-0 group">
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">
                            {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {start.getTime() !== end.getTime() && (
                            <span className="text-[10px] text-muted-foreground font-bold mt-0.5 uppercase tracking-tighter">
                              TO {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <span className="text-xs font-black bg-muted/30 px-2 py-1 rounded-md border border-border/20 uppercase tracking-tighter">
                          {leave.duration}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-foreground">
                              {leave.category === "MONTHLY_POLICY_1" ? "Monthly Policy" : leave.category === "UNPAID" ? "Unpaid Leave" : "Semi-Annual"}
                            </span>
                            {leave.leaveType && (
                              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                                {leave.leaveType}
                              </span>
                            )}
                         </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-muted-foreground text-xs leading-relaxed max-w-[240px]">
                        <p className="truncate" title={leave.reason || "N/A"}>
                          {leave.reason || "No reason provided"}
                        </p>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex justify-end">
                           <StatusBadge 
                             status={getStatusVariant(leave.status)} 
                             label={leave.status} 
                             size="sm" 
                             withDot={true} 
                             className="font-black uppercase tracking-widest px-3"
                           />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </PageSection>
    </PageContainer>
  );
}
