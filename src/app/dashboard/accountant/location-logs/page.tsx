import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { LocationLogsTable } from "@/components/features/accountant/location-logs-table";
import { MonthYearPicker } from "@/components/features/accountant/month-year-picker";
import { MapPin, Layers, ShieldCheck } from "lucide-react";
import { PageContainer, StatCard } from "@/components/ui";

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
    where: { date: { gte: startOfMonth, lte: endOfMonth } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { date: 'desc' },
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
      inside: attendances.filter(a => !a.isOutsideOffice).length,
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
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Location & Attendance Logs</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Geofence verification records for {stats.monthName} {stats.year}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border/60 bg-white text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest shadow-sm">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            Geofencing Active
          </div>
          <MonthYearPicker currentMonth={stats.month} currentYear={stats.year} />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Records"
          value={stats.total}
          subValue={`${stats.monthName} ${stats.year}`}
          icon={<Layers className="size-4" />}
          progress={100}
          progressColor="bg-primary"
        />
        <StatCard
          label="In Office"
          value={stats.inside}
          subValue="Within geofence radius"
          icon={<ShieldCheck className="size-4" />}
          progress={stats.total > 0 ? Math.round((stats.inside / stats.total) * 100) : 0}
          progressColor="bg-emerald-500"
        />
        <StatCard
          label="Out of Office"
          value={stats.outside}
          subValue="Outside authorized radius"
          icon={<MapPin className="size-4" />}
          progress={stats.total > 0 ? Math.round((stats.outside / stats.total) * 100) : 0}
          progressColor="bg-rose-500"
        />
      </div>

      {/* Main Table */}
      <LocationLogsTable data={logs} />
    </PageContainer>
  );
}
