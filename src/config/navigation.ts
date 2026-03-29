import { Home, Users, Calculator, FileText, Settings } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: any;
};

// Define what each role can see
export const roleNavigation: Record<string, NavItem[]> = {
  EMPLOYEE: [
    { title: "My Dashboard", href: "/dashboard/employee", icon: Home },
    { title: "My Leaves", href: "/dashboard/employee/leaves", icon: FileText },
  ],
  MANAGER: [
    { title: "My Dashboard", href: "/dashboard/employee", icon: Home }, // Managers are also employees
    { title: "Team Approvals", href: "/dashboard/manager", icon: Users },
  ],
  ACCOUNTANT: [
    { title: "My Dashboard", href: "/dashboard/employee", icon: Home },
    { title: "Month-End Processing", href: "/dashboard/accountant", icon: Calculator },
  ],
  ADMIN: [
    { title: "System Overview", href: "/dashboard/admin", icon: Settings },
    { title: "All Employees", href: "/dashboard/admin/users", icon: Users },
  ],
};