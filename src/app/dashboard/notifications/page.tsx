import { NotificationList } from "@/components/features/notifications/notification-list";
import { PageContainer } from "@/components/ui";
import { Bell } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-sm">
              <Bell className="size-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Notification Center</h1>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Manage your personal alerts, approvals, and system broadcasts
          </p>
        </div>
      </div>

      <NotificationList />
    </PageContainer>
  );
}
