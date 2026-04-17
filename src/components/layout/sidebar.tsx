"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleNavigation } from "@/config/navigation";
import { Activity } from "lucide-react";

export function Sidebar({ userRole, isTeamLeader }: { userRole: string; isTeamLeader?: boolean }) {
  const pathname = usePathname();

  const baseNav = roleNavigation[userRole] || roleNavigation.EMPLOYEE;
  const navItems = [...baseNav];

  return (
    <aside className="w-60 border-r border-border/40 bg-background flex-col hidden md:flex h-screen sticky top-0 z-10">
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 mr-3 shadow-sm border border-primary/20">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <span className="font-bold text-lg tracking-tight text-foreground">
          Sigma
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mb-4 px-3">
          Overview
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
            >
              <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/40 bg-muted/5">
        <div className="bg-card border border-border/50 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Session</span>
            <span className="text-xs font-semibold text-foreground capitalize">{userRole.toLowerCase()}</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
        </div>
      </div>
    </aside>
  );
}