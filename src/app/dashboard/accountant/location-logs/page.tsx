import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { LocationLogsTable } from "@/components/features/accountant/location-logs-table";
import { MonthYearPicker } from "@/components/features/accountant/month-year-picker";
import { MapPin, Info, Layers } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  PageSection,
  Grid,
  StatCard
} from "@/components/ui";

export const dynamic = 'force-dynamic';

async function getLocationLogs(reqMonth?: number, reqYear?: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ACCOUNTANT" && session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    redirect("/dashboard/employee");
  }

  const now = new Date();
  const currentYear = reqYear || now.getFullYear();
  const currentMonth = reqMonth || now.getMonth() + 1;

  const startOfMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  return {
    logs: attendances.map(a => ({
      id: a.id,
      userName: a.user.name || a.user.email,
      date: a.date,
      punchIn: a.punchIn,
      punchOut: a.punchOut,
      lat: a.lat,
      lng: a.lng,
      isOutsideOffice: a.isOutsideOffice,
      ipAddress: a.ipAddress,
    })),
    stats: {
      total: attendances.length,
      outside: attendances.filter(a => a.isOutsideOffice).length,
      monthName: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }),
      year: currentYear,
      month: currentMonth
    }
  };
}

export default async function LocationLogsPage({
  searchParams
}: {
  searchParams: Promise<{ m?: string; y?: string }>
}) {
  const params = await searchParams;
  const m = params.m ? parseInt(params.m) : undefined;
  const y = params.y ? parseInt(params.y) : undefined;

  const { logs, stats } = await getLocationLogs(m, y);

  return (
    <PageContainer maxWidth="full" className="py-8">
      {/* Header Section */}
      <PageHeader
        title="Location & Geofencing Logs"
        description={`Detailed record of user punch locations and geofence status for ${stats.monthName} ${stats.year}.`}
        breadcrumb={<MonthYearPicker currentMonth={stats.month} currentYear={stats.year} />}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/20 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
              <Info className="size-3" /> Geofencing: Active
            </div>
          </div>
        }
      />

      {/* Summary Stats */}
      <Grid cols={4} className="mb-8 gap-6">
        <StatCard
          label="Total Punches"
          value={stats.total}
          icon={<Layers className="w-8 h-8 opacity-20" />}
          className="animate-fade-in shadow-xl border-border/40"
        />
        <StatCard
          label="Out of Office"
          value={stats.outside}
          icon={<MapPin className="w-8 h-8 text-rose-500 opacity-20" />}
          className="animate-fade-in shadow-xl shadow-rose-500/5 border-rose-500/10 bg-rose-500/[0.02]"
          change={{ value: "Outside Fence", trend: "neutral" }}
        />
        <div className="lg:col-span-2">
          <PageSection className="h-full premium-card bg-primary/[0.02] border-primary/10 shadow-xl" noPadding={false}>
            <div className="flex items-start gap-5">
              <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                <Info className="size-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Intelligent Geofencing</h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed font-medium">
                  "Out of Office" labels indicate punches captured outside the authorized office radius.
                  coordinates are verified in real-time against individual workstation parameters.
                </p>
              </div>
            </div>
          </PageSection>
        </div>
      </Grid>

      {/* Main Logs Section */}
      <PageSection
        title="Attendance Location History"
        description="Review physical location status for each record."
        className="animate-fade-in-up premium-card overflow-hidden"
        noPadding
      >
        <div className="p-1">
          <LocationLogsTable data={logs} />
        </div>
      </PageSection>
    </PageContainer>
  );
}
