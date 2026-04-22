"use client";

import { ChevronRight } from "lucide-react";
import { UserNav } from "@/components/layout/user-nav";
import { NotificationNav } from "@/components/layout/notification-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function Header({ userName, userRole, isTeamLeader }: { userName: string; userRole: string; isTeamLeader?: boolean }) {
  const pathname = usePathname();

  // Helper to get descriptive page title
  const getPageTitle = () => {
    if (pathname.includes("/notifications")) return "Notification Center";
    if (pathname.includes("/calendar")) return "Company Calendar";
    if (pathname.includes("/attendance")) return "My Attendance";
    if (pathname.includes("/leaves")) return "My Leaves";
    if (pathname.includes("/admin/users")) return "Employee Directory";
    if (pathname.includes("/admin/settings")) return "Configuration";
    if (pathname.includes("/admin/departments")) return "Department Management";
    if (pathname.includes("/admin")) return "Admin Overview";
    if (pathname.includes("/location-logs")) return "Location Status";
    if (pathname.includes("/accountant/settings")) return "Configuration";
    if (pathname.includes("/accountant")) return "Payroll & Processing";
    if (pathname === "/dashboard/employee") return "My Workspace";
    return "HR Workspace";
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-50 animate-fade-in">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        

        {/* Page Title for Desktop */}
        <div className="hidden md:flex items-center gap-3 text-sm font-medium animate-fade-in-down">
          <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default capitalize text-[10px] font-black uppercase tracking-widest bg-muted/60 px-2 py-0.5 rounded-sm border border-border/40">
            {userRole.replace('_', ' ').toLowerCase()}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          <span className="text-foreground font-semibold">{getPageTitle()}</span>
        </div>

        {/* Mobile Page Title */}
        <div className="md:hidden flex items-center gap-2 text-sm font-semibold truncate max-w-[150px]">
          <span className="text-foreground truncate">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <NotificationNav />
        <div className="h-6 w-px bg-border/50 mx-1 hidden md:block"></div>
        <UserNav userName={userName} />
      </div>
    </header>
  );
}