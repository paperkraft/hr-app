"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleNavigation } from "@/config/navigation";
import { Activity } from "lucide-react";

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  
  // Fallback to EMPLOYEE if role isn't found
  const navItems = roleNavigation[userRole] || roleNavigation.EMPLOYEE;

  return (
    <aside className="w-64 border-r border-border/50 bg-secondary/10 flex-col hidden md:flex min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Activity className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg tracking-tight">Nexus HRMS</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground text-center">
          Logged in as <span className="font-semibold text-foreground">{userRole}</span>
        </div>
      </div>
    </aside>
  );
}