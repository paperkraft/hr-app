import { MapPin, Globe, Laptop, Users, Search, Filter, ArrowUpDown, Plus, MoreVertical } from "lucide-react";
import prisma from "@/lib/prisma";
import { AddUserDialog } from "@/components/features/admin/add-user-dialog";
import { EditUserDialog } from "@/components/features/admin/edit-user-dialog";
import { DeleteUserButton } from "@/components/features/admin/delete-user-button";
import { PageContainer, PageHeader, StatusBadge, Input, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: {
      role: { not: 'SYSTEM_ADMIN' }
    },
    include: {
      manager: true,
      department: true,
      shift: true,
      location: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const validManagers = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'EMPLOYEE', 'ACCOUNTANT'] }
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  });

  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  const locations = await prisma.location.findMany({
    select: { id: true, name: true, isRemote: true },
    orderBy: { name: 'asc' }
  });

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Employees</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage and collaborate within your organization's workforce</p>
        </div>
        <AddUserDialog
          managers={validManagers}
          departments={departments}
          locations={locations}
        />
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* MarcoHR Tabs Style */}
        <div className="flex items-center gap-1 p-1 bg-muted/30 border border-border/60 rounded-md">
          {["Active", "Onboarding", "Off-boarding", "Dismissed"].map((tab, i) => (
            <button
              key={tab}
              className={cn(
                "px-5 py-2 text-[12px] font-bold rounded-sm transition-all duration-200",
                i === 0
                  ? "bg-white text-primary border border-border/80 shadow-sm"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-white/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* High-Density Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
            <Input
              placeholder="Search people..."
              className="h-10 pl-9 bg-white border-border/80 focus:ring-primary/10 rounded-sm text-xs"
            />
          </div>
          <Button variant="outline" className="h-10 px-4 border-border/80 rounded-sm font-bold text-[11px] gap-2 text-muted-foreground/70 hover:text-foreground">
            <Filter className="size-3.5" /> Filters
          </Button>
          <Button variant="outline" className="h-10 px-4 border-border/80 rounded-sm font-bold text-[11px] gap-2 text-muted-foreground/70 hover:text-foreground">
            <ArrowUpDown className="size-3.5" /> Sort by
          </Button>
        </div>
      </div>

      {/* People Table - Ultra Density */}
      <div className="bg-white border border-border/60 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse">
            <thead className="bg-muted/5 border-b border-border/60">
              <tr>
                <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 w-[300px]">Name</th>
                <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Date</th>
                <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Job title</th>
                <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Employment type</th>
                <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/5 transition-colors group">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted text-foreground/40 flex items-center justify-center font-bold text-[10px] border border-border/40 overflow-hidden group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground leading-snug group-hover:text-primary transition-colors">{user.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium leading-none">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-bold text-foreground/70">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-bold text-foreground/70 tracking-tight">
                      {user.department?.name || "Unassigned"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-bold text-foreground/70 tracking-tight">
                      {user.role === "ADMIN" ? "Corporate Management" : user.role === "ACCOUNTANT" ? "Financial Ops" : "Full-time"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <EditUserDialog
                        user={user}
                        managers={validManagers}
                        departments={departments}
                        locations={locations}
                      />
                      <DeleteUserButton id={user.id} />
                      <Button variant="ghost" size="icon" className="size-8 rounded-sm text-muted-foreground/40 hover:text-foreground">
                        <MoreVertical className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
