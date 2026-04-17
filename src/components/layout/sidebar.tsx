"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleNavigation } from "@/config/navigation";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ userRole, isTeamLeader }: { userRole: string; isTeamLeader?: boolean }) {
  const pathname = usePathname();

  const baseNav = roleNavigation[userRole] || roleNavigation.EMPLOYEE;
  const navItems = [...baseNav];

  return (
    <aside className="w-64 border-r border-border/40 bg-sidebar flex-col hidden md:flex h-screen sticky top-0 z-10">
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm transition-transform duration-300">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="ml-3 flex flex-col">
            <span className="font-sans font-bold text-lg leading-none tracking-tight text-foreground">
              Sigma
            </span>
            <span className="text-[9px] font-bold text-primary tracking-widest uppercase mt-0.5">Workspace</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 custom-scrollbar">
        <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em] mb-5 px-4">
          Management
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(var(--primary),0.25)]"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "size-4.5 transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:translate-x-0.5"
              )} />
              <span className="relative z-10">{item.title}</span>
              {isActive && (
                <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/40 bg-muted/20">
        <div className="glass px-4 py-4 rounded-2xl flex items-center justify-between border-white/40 dark:border-white/5 shadow-lg group">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">Authenticated</span>
            <span className="text-xs font-bold text-foreground capitalize tracking-tight group-hover:text-primary transition-colors">{userRole.toLowerCase()}</span>
          </div>
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 blur-[2px]" />
          </div>
        </div>
      </div>
    </aside>
  );
}