import {
  History,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
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
    <PageContainer maxWidth="full" className="py-8">
      {/* Header */}
      <PageHeader
        title="Attendance History"
        description="A comprehensive record of your work shifts and punctuality."
        breadcrumb={<span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Dashboard / Attendance</span>}
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="premium-card h-10 border-border/60 hover:bg-muted/50 text-[11px] font-black uppercase tracking-widest shadow-sm">
              <Download className="w-4 h-4 mr-2" />
              Export History
            </Button>
            <Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-md">
              Apply Correction
            </Button>
          </div>
        }
      />

      {/* Stats Summary */}
      <Grid cols={4} className="mb-8 gap-6">
        <StatCard
          label="Total Records"
          value={stats.totalPunches}
          icon={<History className="w-8 h-8 opacity-20" />}
          className="animate-fade-in shadow-xl border-border/40"
        />
        <StatCard
          label="On Time"
          value={stats.onTime}
          icon={<CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-20" />}
          className="animate-fade-in shadow-xl shadow-emerald-500/5 border-emerald-500/10 bg-emerald-500/[0.02]"
          change={{ value: "Policy Regular", trend: "up" }}
        />
        <StatCard
          label="Late Marks"
          value={stats.late}
          icon={<Clock className="w-8 h-8 text-amber-500 opacity-20" />}
          className="animate-fade-in shadow-xl shadow-amber-500/5 border-amber-500/10 bg-amber-500/2"
          change={{ value: "Strict Policy", trend: "down" }}
        />
        <StatCard
          label="Auto Punches"
          value={stats.autoPunchOuts}
          icon={<AlertCircle className="w-8 h-8 text-rose-500 opacity-20" />}
          className="animate-fade-in shadow-xl shadow-rose-500/5 border-rose-500/10 bg-rose-500/2"
          change={{ value: "Forgotten", trend: "neutral" }}
        />
      </Grid>

      {/* Main Logs Section */}
      <PageSection
        title="Recent Activity"
        description="Detailed shift history for the last 50 entries"
        className="animate-fade-in-up premium-card overflow-hidden"
        noPadding
      >
        <div className="p-1">
          <AttendanceHistoryTable logs={logs} />
        </div>
      </PageSection>
    </PageContainer>
  );
}

