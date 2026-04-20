import { Home, Users, Calculator, FileText, Settings, ShieldCheck, LayoutDashboard, Building2, Activity, MapPin, CalendarDays } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: any;
};

export const roleNavigation: Record<string, NavItem[]> = {
  EMPLOYEE: [
    { title: "My Space", href: "/dashboard/employee", icon: Home },
    { title: "Full Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    { title: "My Attendance", href: "/dashboard/employee/attendance", icon: Activity },
    { title: "My Leaves", href: "/dashboard/employee/leaves", icon: FileText },
  ],
  ACCOUNTANT: [
    { title: "My Space", href: "/dashboard/employee", icon: Home },
    { title: "Full Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    { title: "My Attendance", href: "/dashboard/employee/attendance", icon: Activity },
    { title: "Payroll & Processing", href: "/dashboard/accountant", icon: Calculator },
    { title: "Location Status", href: "/dashboard/accountant/location-logs", icon: MapPin },
  ],
  ADMIN: [
    { title: "System Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Full Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    { title: "Configuration", href: "/dashboard/admin/settings", icon: Settings },
    { title: "Employees", href: "/dashboard/admin/users", icon: Users },
    { title: "Departments", href: "/dashboard/admin/departments", icon: Building2 },
    { title: "Payroll & Processing", href: "/dashboard/accountant", icon: Calculator },
  ],
  SYSTEM_ADMIN: [
    { title: "System Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Full Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    { title: "Configuration", href: "/dashboard/admin/settings", icon: Settings },
    { title: "Employees", href: "/dashboard/admin/users", icon: Users },
    { title: "Departments", href: "/dashboard/admin/departments", icon: Building2 },
    { title: "Payroll & Processing", href: "/dashboard/accountant", icon: Calculator },
  ],
};