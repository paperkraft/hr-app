import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Users, Clock, FileText, IndianRupee, MapPin, CalendarDays } from "lucide-react";
import { CancelLeaveButton } from "@/components/features/leave/cancel-leave-button";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Payroll & Processing</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Operational dashboard for {stats.currentMonthName} {stats.currentYear}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
              <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">End-of-month salary calculation base</p>
            </div>
            <FileText className="size-4 text-muted-foreground/20" />
          </div>
          <div className="p-0">
            <MasterReportTable data={reportData} month={stats.currentMonth} year={stats.currentYear} />
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-sm overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-border/40 bg-muted/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">History & Recent Approvals</h3>
              <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Aduit log for current cycle</p>
            </div>
            <CalendarDays className="size-4 text-muted-foreground/20" />
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="py-3 px-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Employee</TableHead>
                  <TableHead className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Period & Type</TableHead>
                  <TableHead className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Policy Branch</TableHead>
                  <TableHead className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">System Note</TableHead>
                  <TableHead className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Date</TableHead>
                  <TableHead className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApprovals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-[10px] text-muted-foreground/30 font-black uppercase tracking-widest">No recent records</TableCell>
                  </TableRow>
                ) : (
                  recentApprovals.map((req: any) => (
                    <TableRow key={req.id} className="hover:bg-muted/5 transition-colors border-b border-border/10 last:border-0 group">
                      <TableCell className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-sm bg-muted text-foreground/40 flex items-center justify-center font-bold text-[9px] border border-border/40 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            {req.employeeName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-foreground leading-none">{req.employeeName}</div>
                            <div className="text-[9px] text-muted-foreground/40 font-bold uppercase mt-0.5">{req.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-foreground/70 leading-none">
                            {req.startDate === req.endDate ? req.startDate : `${req.startDate} — ${req.endDate}`}
                          </span>
                          <span className="text-[9px] text-muted-foreground/40 font-black uppercase mt-1">
                            {req.duration} SESSION
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-black text-foreground/60 uppercase tracking-tight">
                            {req.category.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[8px] text-muted-foreground/40 font-black uppercase">{req.leaveType || 'General'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {req.systemNote ? (
                          <div className="flex items-center gap-1.5 overflow-hidden max-w-[140px]">
                            <div className="size-1 bg-emerald-500 rounded-full shrink-0" />
                            <span className="text-[10px] text-muted-foreground/60 font-medium truncate italic" title={req.systemNote}>"{req.systemNote}"</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="size-1 bg-sky-500 rounded-full shrink-0" />
                            <span className="text-[10px] text-muted-foreground/60 font-medium">Manual Log</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-right">
                        <span className="text-[10px] font-bold text-muted-foreground/40 tabular-nums">
                          {new Date(req.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-5 text-right">
                        <CancelLeaveButton requestId={req.id} employeeName={req.employeeName} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}