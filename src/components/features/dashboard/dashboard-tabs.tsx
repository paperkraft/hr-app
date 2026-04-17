"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarRange, Calendar, History } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Dashboard", href: "/dashboard/employee", icon: LayoutDashboard },
  { name: "Request Leave", href: "/dashboard/employee/leaves", icon: CalendarRange },
  { name: "Calendar", href: "/dashboard/employee/calendar", icon: Calendar },
  { name: "History", href: "/dashboard/employee/attendance", icon: History },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl w-fit border border-border/40">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-background text-primary shadow-sm ring-1 ring-border/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <tab.icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
