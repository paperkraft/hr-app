"use client";

import { Menu, Bell, Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { roleNavigation } from "@/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header({ userName, userRole, isTeamLeader }: { userName: string; userRole: string; isTeamLeader?: boolean }) {
  const pathname = usePathname();

  const baseNav = roleNavigation[userRole] || roleNavigation.EMPLOYEE;
  const navItems = [...baseNav];

  // Helper to get descriptive page title
  const getPageTitle = () => {
    if (pathname.includes("/attendance")) return "My Attendance";
    if (pathname.includes("/leaves")) return "Leave Management";
    if (pathname.includes("/admin/users")) return "Employee Directory";
    if (pathname.includes("/admin/settings")) return "System Configuration";
    if (pathname.includes("/admin/departments")) return "Departments";
    if (pathname.includes("/admin")) return "Admin Overview";
    if (pathname.includes("/accountant")) return "Payroll & Processing";
    if (pathname === "/dashboard/employee") return "My Space";
    return "HR Workspace";
  };

  return (
    <header className="h-16 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 transition-all duration-300 animate-fade-in">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle via Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-secondary/80 transition-colors"
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col animate-slide-in-right">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="h-16 flex items-center px-6 border-b border-border/50 bg-muted/30">
              <Activity className="w-6 h-6 text-primary mr-2" />
              <span className="font-bold text-lg tracking-tight text-gradient">Sigma HRMS</span>
            </div>
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                Main Menu
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Page Title for Desktop */}
        <div className="hidden md:flex items-center gap-3 text-sm font-medium animate-fade-in-down">
          <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default capitalize text-xs font-semibold uppercase">
            {userRole.toLowerCase()}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          <span className="text-foreground font-semibold">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground relative rounded-full transition-all duration-200 hover-glow"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive border-2 border-background rounded-full animate-pulse"></span>
        </Button>
        <div className="h-6 w-px bg-border/50 mx-1 hidden md:block"></div>
        <UserNav userName={userName} />
      </div>
    </header>
  );
}