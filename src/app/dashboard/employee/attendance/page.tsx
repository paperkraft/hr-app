import {
  History,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Activity,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  PageContainer,
  PageHeader,
  PageSection,
  Grid,
  StatCard,
} from "@/components/ui";
import { AttendanceHistoryTable } from "@/components/features/dashboard/attendance-history-table";

export const dynamic = 'force-dynamic';

async function getAttendanceHistory() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const logs = await prisma.attendance.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 50
  });

  const stats = {
    totalPunches: logs.length,
    onTime: logs.filter(l => !l.isLate && l.punchIn).length,
    late: logs.filter(l => l.isLate).length,
    autoPunchOuts: logs.filter(l => l.isAutoPunchOut).length,
  };

  return { logs, stats };
}

export default async function AttendanceHistoryPage() {
  const { logs, stats } = await getAttendanceHistory();

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Session Metrics"
        description="Comprehensive audit log of infrastructure synchronization and punctuality."
        breadcrumb={<span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Framework / Attendance</span>}
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="premium-card h-11 border-border/40 hover:bg-muted/50 text-[10px] font-black uppercase tracking-widest px-6 rounded-xl shadow-sm transition-all active:scale-95">
              <Download className="size-4 mr-2" />
              Infrastructure Export
            </Button>
            <Button className="h-11 bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
              Request Alignment
            </Button>
          </div>
        }
      />

      {/* Stats Summary */}
      <Grid cols={4} className="mb-10">
        <StatCard
          label="Verified Pulses"
          value={stats.totalPunches}
          icon={<History className="size-8" />}
          className="premium-card shadow-xl"
        />
        <StatCard
          label="Compliant Sessions"
          value={stats.onTime}
          icon={<CheckCircle2 className="size-8 text-emerald-500" />}
          className="premium-card shadow-xl border-emerald-500/10"
          change={{ value: "Regularity: High", trend: "up" }}
        />
        <StatCard
          label="Temporal Anomalies"
          value={stats.late}
          icon={<Clock className="size-8 text-amber-500" />}
          className="premium-card shadow-xl border-amber-500/10"
          change={{ value: "Threshold: Minor", trend: "down" }}
        />
        <StatCard
          label="Autonomous Closures"
          value={stats.autoPunchOuts}
          icon={<AlertCircle className="size-8 text-rose-500" />}
          className="premium-card shadow-xl border-rose-500/10"
          change={{ value: "Policy Target", trend: "neutral" }}
        />
      </Grid>

      {/* Main Logs Section */}
      <div className="premium-card shadow-xl border-border/40 overflow-hidden">
        <div className="px-6 py-5 bg-primary/2 border-b border-border/40 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                 <Activity className="size-5" />
              </div>
              <div className="flex flex-col">
                 <h3 className="text-sm font-black uppercase tracking-widest text-foreground leading-none mb-1">Operational Activity</h3>
                 <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">Filtered Registry (Last 50)</p>
              </div>
           </div>
        </div>
        <div className="p-1">
          <AttendanceHistoryTable logs={logs} />
        </div>
      </div>
    </PageContainer>
  );
}

