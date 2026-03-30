"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleNavigation } from "@/config/navigation";
import { Activity } from "lucide-react";

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const navItems = roleNavigation[userRole] || roleNavigation.EMPLOYEE;

  return (
    <aside className="w-64 border-r border-border/40 bg-card flex-col hidden md:flex min-h-screen shadow-sm z-10">
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 mr-3">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Sigma HRMS
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-4 px-3">
          Overview
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
            >
              <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/40 bg-muted/10">
        <div className="bg-background border border-border/50 rounded-lg p-3 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Access Level</span>
            <span className="text-sm font-semibold text-foreground capitalize">{userRole.toLowerCase()}</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>
      </div>
    </aside>
  );
}