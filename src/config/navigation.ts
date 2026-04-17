import { Home, Users, Calculator, FileText, Settings, ShieldCheck, LayoutDashboard, Building2, Activity, MapPin } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: any;
};

export const roleNavigation: Record<string, NavItem[]> = {
  EMPLOYEE: [
    { title: "My Space", href: "/dashboard/employee", icon: Home },
    { title: "My Attendance", href: "/dashboard/employee/attendance", icon: Activity },
    { title: "My Leaves", href: "/dashboard/employee/leaves", icon: FileText },
  ],
  ACCOUNTANT: [
    { title: "My Space", href: "/dashboard/employee", icon: Home },
    { title: "My Attendance", href: "/dashboard/employee/attendance", icon: Activity },
    { title: "Payroll & Processing", href: "/dashboard/accountant", icon: Calculator },
    { title: "Location Status", href: "/dashboard/accountant/location-logs", icon: MapPin },
  ],
  ADMIN: [
    { title: "System Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Location Status", href: "/dashboard/accountant/location-logs", icon: MapPin },
    { title: "Configuration", href: "/dashboard/admin/settings", icon: Settings }, // Added configuration page
    { title: "Directory", href: "/dashboard/admin/users", icon: Users },
    { title: "Departments", href: "/dashboard/admin/departments", icon: Building2 },
  ],
  SYSTEM_ADMIN: [
    { title: "System Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Location Status", href: "/dashboard/accountant/location-logs", icon: MapPin },
    { title: "Configuration", href: "/dashboard/admin/settings", icon: Settings },
    { title: "Directory", href: "/dashboard/admin/users", icon: Users },
    { title: "Departments", href: "/dashboard/admin/departments", icon: Building2 },
  ],
};