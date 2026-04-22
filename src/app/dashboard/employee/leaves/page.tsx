import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RequestLeaveButton } from "@/components/features/leave/request-leave-button";
import { LeaveHistoryTable } from "@/components/features/leave/leave-history-table";
import {
  PageContainer,
  StatCard,
} from "@/components/ui";
import { CalendarRange, History, Clock4, AlertCircle } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      <div className="bg-card border border-border rounded-sm overflow-hidden animate-fade-in">
        <div className="px-5 py-4 border-b border-border/40 bg-muted/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">Leave History</h3>
            <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Complete record of applications</p>
          </div>
        </div>

        <div className="p-0">
          <LeaveHistoryTable leaves={data.leaves} />
        </div>
      </div>
    </PageContainer>
  );
}
