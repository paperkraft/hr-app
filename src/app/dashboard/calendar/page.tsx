import { PageContainer } from "@/components/ui";
import { FullCalendar } from "@/components/features/calendar/full-calendar";
import { getCalendarEvents } from "@/actions/calendar";
import { DashboardTabs } from "@/components/features/dashboard/dashboard-tabs";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const result = await getCalendarEvents();

  if (!result.success) {
    return (
      <PageContainer maxWidth="full">
        <div className="p-8 text-center bg-card border border-border rounded-sm">
          <p className="text-red-500 font-bold uppercase tracking-widest text-[10px]">Error loading calendar</p>
        </div>
      </PageContainer>
    );
  }

  const { holidays, birthdays, announcements, anniversaries } = result.data!;

  return (
    <PageContainer maxWidth="full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Company Calendar</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Global view of holidays, birthdays and anniversaries</p>
          </div>
        </div>
 
        <DashboardTabs />
 
        <div className="flex-1">
          <FullCalendar
            initialHolidays={holidays}
            initialBirthdays={birthdays}
            initialAnniversaries={anniversaries}
            initialAnnouncements={announcements}
          />
        </div>
      </div>
    </PageContainer>
  );
}
