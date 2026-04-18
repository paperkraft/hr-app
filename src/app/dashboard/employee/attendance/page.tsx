import {
  History,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  CalendarDays,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  PageContainer,
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
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Attendance History</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Audit log of your daily check-in and checkout sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 px-4 border-border/60 hover:bg-muted/5 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-all">
            <Download className="size-3.5 mr-1.5 text-muted-foreground/60" /> Export CSV
          </Button>
          <Button className="h-9 px-4 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-all">
            Alignment Request
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Logs"
          value={stats.totalPunches}
          subValue="All tracked sessions"
          icon={<History className="size-4" />}
          progress={100}
          progressColor="bg-primary"
        />
        <StatCard
          label="On-Time"
          value={stats.onTime}
          subValue="Compliant arrivals"
          icon={<CheckCircle2 className="size-4" />}
          progress={stats.totalPunches > 0 ? (stats.onTime / stats.totalPunches) * 100 : 0}
          progressColor="bg-emerald-500"
        />
        <StatCard
          label="Late Arrivals"
          value={stats.late}
          subValue="Delayed check-ins"
          icon={<Clock className="size-4" />}
          progress={stats.totalPunches > 0 ? (stats.late / stats.totalPunches) * 100 : 0}
          progressColor="bg-amber-500"
        />
        <StatCard
          label="Auto Checkout"
          value={stats.autoPunchOuts}
          subValue="System closures"
          icon={<AlertCircle className="size-4" />}
          progress={stats.totalPunches > 0 ? (stats.autoPunchOuts / stats.totalPunches) * 100 : 0}
          progressColor="bg-rose-500"
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-border/60 rounded-sm shadow-sm overflow-hidden animate-fade-in">
        <div className="px-5 py-4 border-b border-border/40 bg-muted/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">Session Logs</h3>
            <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">Recent operational activity registry</p>
          </div>
          <CalendarDays className="size-4 text-muted-foreground/20" />
        </div>
        <div className="p-0">
          <AttendanceHistoryTable logs={logs} />
        </div>
      </div>
    </PageContainer>
  );
}
