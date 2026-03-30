import { Home, Users, Calculator, FileText, Settings, ShieldCheck, LayoutDashboard } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: any;
};

export const roleNavigation: Record<string, NavItem[]> = {
  EMPLOYEE: [
    { title: "My Space", href: "/dashboard/employee", icon: Home },
    { title: "My Leaves", href: "/dashboard/employee/leaves", icon: FileText },
  ],
  MANAGER: [
    { title: "My Space", href: "/dashboard/employee", icon: Home },
    { title: "My Leaves", href: "/dashboard/employee/leaves", icon: FileText },
    { title: "Team Management", href: "/dashboard/manager", icon: ShieldCheck }, // Clearly separated
  ],
  ACCOUNTANT: [
    { title: "My Space", href: "/dashboard/employee", icon: Home },
    { title: "Payroll & Processing", href: "/dashboard/accountant", icon: Calculator },
  ],
  ADMIN: [
    { title: "System Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Configuration", href: "/dashboard/admin/settings", icon: Settings }, // Added configuration page
    { title: "Directory", href: "/dashboard/admin/users", icon: Users },
  ],
};