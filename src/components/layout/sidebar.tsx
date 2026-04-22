"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  const baseNav = roleNavigation[userRole] || roleNavigation.EMPLOYEE;
  const navItems = [...baseNav];

  return (
    <aside className="w-[260px] border-r border-sidebar-border bg-sidebar flex-col hidden md:flex h-screen sticky top-0 z-10 transition-all duration-300">
      {/* Branding Section */}
      <div className="h-14 flex items-center px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <Image 
            src="/logo.svg" 
            alt="Sigma HRMS" 
            width={160} 
            height={50} 
            className="h-9 w-auto"
            priority
          />
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
                  ? "bg-primary/5 text-primary border border-primary/10"
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
    </aside>
  );
}