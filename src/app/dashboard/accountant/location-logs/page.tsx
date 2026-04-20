import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LocationLogsTable } from "@/components/features/accountant/location-logs-table";
import { MonthYearPicker } from "@/components/features/accountant/month-year-picker";
import { MapPin, Layers, ShieldCheck } from "lucide-react";
import { PageContainer, StatCard } from "@/components/ui";
import { getLocationLogsAction } from "@/actions/accountant";

export const dynamic = 'force-dynamic';

export default async function LocationLogsPage({
  searchParams
}: {
  searchParams: Promise<{ m?: string; y?: string }>
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ACCOUNTANT" && session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    redirect("/dashboard/employee");
  }

  const params = await searchParams;
  const m = params.m ? parseInt(params.m) : undefined;
  const y = params.y ? parseInt(params.y) : undefined;

  const result = await getLocationLogsAction(m, y);
  if (!result.success || !result.data) return <div>Error loading logs</div>;
  const { logs, stats } = result.data;

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Location & Attendance Logs</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Geofence verification records for {stats.monthName} {stats.year}
          </p>
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
