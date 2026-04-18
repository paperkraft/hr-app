"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleNavigation } from "@/config/navigation";
import { 
  Activity, Settings, LifeBuoy, LayoutDashboard, 
  Users, Building2, Calculator, MapPin, Home, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ userRole, isTeamLeader }: { userRole: string; isTeamLeader?: boolean }) {
  const pathname = usePathname();

  const baseNav = roleNavigation[userRole] || roleNavigation.EMPLOYEE;
  const navItems = [...baseNav];

  return (
    <aside className="w-[260px] border-r border-sidebar-border bg-sidebar flex flex-col hidden md:flex h-screen sticky top-0 z-10 transition-all duration-300">
      {/* Branding Section */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-primary shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Activity className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
            Sigma <span className="text-primary/70">HRMS</span>
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto pt-4 px-3 space-y-0.5 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-sm text-[12px] font-bold transition-all duration-200 group",
                isActive
                  ? "bg-primary/[0.05] text-primary border border-primary/10"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "size-4 transition-all duration-200",
                isActive ? "text-primary opacity-100" : "text-sidebar-foreground/40 group-hover:text-primary/50"
              )} />
              <span className="tracking-tight">{item.title}</span>
              {isActive && (
                <div className="ml-auto w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Utilities */}
      <div className="p-4 space-y-0.5 border-t border-sidebar-border/50 bg-muted/5">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-[12px] font-bold text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-foreground transition-all duration-200 group"
        >
          <Settings className="size-4 text-sidebar-foreground/40 group-hover:text-primary/50 transition-colors" />
          <span className="tracking-tight">Settings</span>
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-[12px] font-bold text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-foreground transition-all duration-200 group"
        >
          <LifeBuoy className="size-4 text-sidebar-foreground/40 group-hover:text-primary/50 transition-colors" />
          <span className="tracking-tight">Support</span>
        </Link>
      </div>
    </aside>
  );
}