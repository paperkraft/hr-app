"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, History } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Dashboard", href: "/dashboard/employee", icon: LayoutDashboard },
  { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "My Leaves", href: "/dashboard/employee/leaves", icon: CalendarDays },
  { name: "Attendance", href: "/dashboard/employee/attendance", icon: History },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1 bg-muted/10 p-1 rounded-sm w-fit border border-border/60 min-w-max">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 h-8 px-4 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-card text-primary border border-border"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon className={cn("size-3.5", isActive ? "text-primary" : "text-muted-foreground/30")} />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
