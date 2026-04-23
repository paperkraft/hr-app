import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Users, Clock, FileText, IndianRupee, MapPin, CalendarDays } from "lucide-react";
import { RecentApprovalsTable } from "@/components/features/dashboard/recent-approvals-table";
import { ExportLedgerButton } from "@/components/features/accountant/export-ledger-button";
import { MasterReportTable } from "@/components/features/accountant/master-report-table";
import { MonthYearPicker } from "@/components/features/accountant/month-year-picker";
import { FinancialSyncButton } from "@/components/features/accountant/financial-sync-button";
import Link from "next/link";
import {
  PageContainer,
  StatCard
} from "@/components/ui";
import { AccountantTabs } from "@/components/features/accountant/accountant-tabs";
import { getAccountantDashboardStats } from "@/actions/dashboard";

export const dynamic = 'force-dynamic';

export default async function AccountantDashboard({
  searchParams
}: {
  searchParams: Promise<{ m?: string; y?: string; tab?: string }>
}) {
  const params = await searchParams;
  const m = params.m ? parseInt(params.m) : undefined;
  const y = params.y ? parseInt(params.y) : undefined;
  const tab = params.tab || "report";

  const result = await getAccountantDashboardStats(m, y);
  if (!result.success || !result.data) return null;
  const { reportData, stats, recentApprovals } = result.data;

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Payroll & Processing</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Operational dashboard for {stats.currentMonthName} {stats.currentYear}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <MonthYearPicker currentMonth={stats.currentMonth} currentYear={stats.currentYear} />
          <FinancialSyncButton />
          <ExportLedgerButton data={reportData} month={stats.currentMonthName} />
        </div>
      </div>

      {/* Modernized 6-Column Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Staff"
          value={stats.totalStaff}
          subValue="Active payroll members"
          icon={<Users className="size-4" />}
          progress={100}
          progressColor="bg-primary"
        />
        <StatCard
          label="Encashments"
          value={`${stats.totalEncashments}d`}
          subValue="Approved conversions"
          icon={<IndianRupee className="size-4" />}
          progress={stats.totalEncashments > 0 ? 50 : 0}
          progressColor="bg-emerald-500"
        />
        <StatCard
          label="Total Late"
          value={stats.totalLates}
          subValue="Delayed sessions"
          icon={<Clock className="size-4" />}
          progress={stats.totalLates > 50 ? 80 : 20}
          progressColor="bg-amber-500"
        />
        <StatCard
          label="Total LWP"
          value={`${stats.totalLwp}d`}
          subValue="Salary deductions"
          icon={<FileText className="size-4" />}
          progress={stats.totalLwp > 0 ? 40 : 0}
          progressColor="bg-rose-500"
        />
        <StatCard
          label="Allowances"
          value={`${stats.totalAllowances}d`}
          subValue="Project/Travel"
          icon={<MapPin className="size-4" />}
          progress={stats.totalAllowances > 0 ? 30 : 0}
          progressColor="bg-sky-500"
        />
        <Link href={`/dashboard/accountant/location-logs?m=${stats.currentMonth}&y=${stats.currentYear}`} className="block group">
          <StatCard
            label="Out-Office"
            value={reportData.reduce((acc, curr) => acc + curr.offSiteCount, 0)}
            subValue="External check-ins"
            icon={<MapPin className="size-4 group-hover:scale-110 transition-transform" />}
            progress={20}
            progressColor="bg-emerald-400"
            className="hover:border-primary/20 transition-colors"
          />
        </Link>
      </div>

      <AccountantTabs />

      {tab === "report" ? (
        <div className="bg-card border border-border rounded-sm overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-border/40 bg-muted/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">Master Report</h3>
              <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">End-of-month salary calculation</p>
            </div>
            <FileText className="size-4 text-muted-foreground/20" />
          </div>
          <div className="p-0">
            <MasterReportTable data={reportData} month={stats.currentMonth} year={stats.currentYear} />
          </div>
        </div>
      ) : (
        <RecentApprovalsTable
          data={recentApprovals}
          title="History & Recent Approvals"
          subtitle="Audit log for current cycle"
        />
      )}
    </PageContainer>
  );
}