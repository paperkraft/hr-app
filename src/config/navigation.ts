import { Home, Users, Calculator, FileText, Settings, ShieldCheck, LayoutDashboard, Building2, Activity, MapPin, CalendarDays } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: any;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const roleNavigation: Record<string, NavGroup[]> = {
  EMPLOYEE: [
    {
      title: "My Workspace",
      items: [
        { title: "My Space", href: "/dashboard/employee", icon: Home },
        { title: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
        { title: "My Attendance", href: "/dashboard/employee/attendance", icon: Activity },
        { title: "My Leaves", href: "/dashboard/employee/leaves", icon: FileText },
      ]
    }
  ],
  ACCOUNTANT: [
    {
      title: "My Workspace",
      items: [
        { title: "My Space", href: "/dashboard/employee", icon: Home },
        { title: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
        { title: "My Attendance", href: "/dashboard/employee/attendance", icon: Activity },
      ]
    },
    {
      title: "Accounting & Finance",
      items: [
        { title: "Payroll & Processing", href: "/dashboard/accountant", icon: Calculator },
      ]
    },
    {
      title: "Administration",
      items: [
        { title: "Configuration", href: "/dashboard/accountant/settings", icon: Settings },
        { title: "Employees", href: "/dashboard/accountant/users", icon: Users },
        { title: "Location Status", href: "/dashboard/accountant/location-logs", icon: MapPin },
        { title: "Department", href: "/dashboard/accountant/department", icon: Building2 },
      ]
    }
  ],
  ADMIN: [
    {
      title: "Administration",
      items: [
        { title: "System Overview", href: "/dashboard/admin", icon: LayoutDashboard },
        { title: "Employees", href: "/dashboard/admin/users", icon: Users },
        { title: "Departments", href: "/dashboard/admin/departments", icon: Building2 },
        { title: "Configuration", href: "/dashboard/admin/settings", icon: Settings },
      ]
    },
    {
      title: "Accounting Access",
      items: [
        { title: "Payroll & Processing", href: "/dashboard/accountant", icon: Calculator },
      ]
    },
    {
      title: "General",
      items: [
        { title: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
      ]
    }
  ],
  SYSTEM_ADMIN: [
    {
      title: "Administration",
      items: [
        { title: "System Overview", href: "/dashboard/admin", icon: LayoutDashboard },
        { title: "Employees", href: "/dashboard/admin/users", icon: Users },
        { title: "Departments", href: "/dashboard/admin/departments", icon: Building2 },
        { title: "Configuration", href: "/dashboard/admin/settings", icon: Settings },
      ]
    },
    {
      title: "Accounting Access",
      items: [
        { title: "Payroll & Processing", href: "/dashboard/accountant", icon: Calculator },
      ]
    },
    {
      title: "General",
      items: [
        { title: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
      ]
    }
  ],
};
