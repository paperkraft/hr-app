import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { LocationLogsTable } from "@/components/features/accountant/location-logs-table";
import { MonthYearPicker } from "@/components/features/accountant/month-year-picker";
import { MapPin, Info } from "lucide-react";

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
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <MapPin className="size-6 text-primary" />
             <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Location Status Logs
            </h1>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 mt-1">
            <p className="text-muted-foreground text-sm md:text-base">
              Detailed log of user login locations and geofence status for {stats.monthName} {stats.year}.
            </p>
            <div className="hidden md:block h-4 w-px bg-border/60 mx-1" />
            <MonthYearPicker currentMonth={stats.month} currentYear={stats.year} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Punches
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card">
          <CardHeader className="pb-2 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-destructive">
              Out of Office
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-destructive">{stats.outside}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="size-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">About Geofencing</p>
              <p>
                Employees labeled as "Out of Office" punched in from a location outside their assigned office radius. 
                Locations are captured at the moment of Punch In.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="shadow-sm border-border/40 p-0 overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/10 p-4">
          <CardTitle className="text-lg">Attendance Location Logs</CardTitle>
          <CardDescription>Review individual punch records and their physical location status.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <LocationLogsTable data={logs} />
        </CardContent>
      </Card>
    </div>
  );
}
