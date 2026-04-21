import { AttendanceCard } from "@/components/features/attendance/punch-card";
import { RequestLeaveButton } from "@/components/features/leave/request-leave-button";
import { AllowanceRequestDialog } from "@/components/features/leave/allowance-request-dialog";
import { DashboardTabs } from "@/components/features/dashboard/dashboard-tabs";
import { TeamOnLeave } from "@/components/features/dashboard/team-on-leave";
import { UpcomingLeave } from "@/components/features/dashboard/upcoming-leave";
import { LeaveBalanceOverview } from "@/components/features/dashboard/leave-balance-overview";
import { PageContainer } from "@/components/ui";
import { UpcomingMilestones } from "@/components/features/dashboard/upcoming-milestones";
import { CommunicationHub } from "@/components/features/dashboard/communication-hub";
import { getEmployeeDashboardStats } from "@/actions/dashboard";

export const dynamic = 'force-dynamic';

export default async function EmployeeDashboard() {
  const result = await getEmployeeDashboardStats();
  if (!result.success || !result.data) return null;
  const data = result.data;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-4">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {greeting}, {data.userName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AllowanceRequestDialog />
          <RequestLeaveButton />
        </div>
      </div>

      {/* Navigation Tabs */}
      <DashboardTabs />

      {/* TOP PRIORITY ROW: Check In/Out + Leave Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Check In/Out — Primary daily action, first and prominent */}
        <div className="lg:col-span-5">
          <AttendanceCard
            initialStatus={data.sessionStatus}
            autoPunchOutCount={data.autoPunchOutCount}
            warningThreshold={3}
          />
        </div>

        {/* Leave Balance — 2×2 stat grid alongside attendance */}
        <div className="lg:col-span-7">
          <LeaveBalanceOverview
            casual={{
              remaining: data.balances.casualRemaining
            }}
            casualYearly={{
              taken: data.balances.casualYearlyTaken,
              total: data.balances.casualYearlyTotal
            }}
            sickYearly={{
              taken: data.balances.sickYearlyTaken,
              total: data.balances.sickYearlyTotal
            }}
            earned={{
              remaining: data.balances.earnedRemaining,
              total: data.balances.earnedYearlyTotal
            }}
          />
        </div>

      </div>

      {/* SECONDARY ROW: Balanced Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* 1. Upcoming Events */}
        <div className="flex flex-col">
          <UpcomingMilestones
            holidays={data.holidays}
            nextBirthday={data.stats.nextBirthday}
            nextAnniversary={data.stats.nextAnniversary}
          />
        </div>

        {/* 2. My Upcoming Leaves */}
        <div className="flex flex-col">
          <UpcomingLeave requests={data.leaveRequests.map(r => ({
            id: r.id,
            category: r.category === "MONTHLY_POLICY_1" ? (r.leaveType === "CASUAL" ? "Casual" : "Sick") : "Paid",
            startDate: r.startDate,
            endDate: r.endDate,
            status: r.status,
            days: Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
          }))} />
        </div>

        {/* 3. Broadcast & Feed Hub */}
        <div className="flex flex-col">
          <CommunicationHub
            announcements={data.announcements}
            notifications={data.notifications}
          />
        </div>

        {/* 4. Team Activity */}
        <div className="flex flex-col">
          <TeamOnLeave members={data.teamOnLeave} />
        </div>

      </div>
    </PageContainer>
  );
}