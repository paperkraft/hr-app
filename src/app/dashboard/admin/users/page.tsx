import { MapPin, Globe, Laptop, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { AddUserDialog } from "@/components/features/admin/add-user-dialog";
import { EditUserDialog } from "@/components/features/admin/edit-user-dialog";
import { DeleteUserButton } from "@/components/features/admin/delete-user-button";
import { PageContainer, PageHeader, StatusBadge } from "@/components/ui";

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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <StatusBadge status="warning" label="Admin" size="sm" className="font-black uppercase tracking-widest px-2.5 h-6 text-[9px] shadow-sm" />;
      case "ACCOUNTANT":
        return <StatusBadge status="info" label="Accountant" size="sm" className="font-black uppercase tracking-widest px-2.5 h-6 text-[9px] shadow-sm" />;
      default:
        return <StatusBadge status="success" label="Employee" size="sm" className="font-black uppercase tracking-widest px-2.5 h-6 text-[9px] shadow-sm" />;
    }
  };

  const getWorkModeBadge = (mode: string) => {
    switch (mode) {
      case "REMOTE":
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/5 text-blue-600 border border-blue-500/10 text-[9px] font-black uppercase tracking-widest">
            <Laptop className="size-3" /> Remote
          </div>
        );
      case "HYBRID":
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 text-[9px] font-black uppercase tracking-widest">
            <Globe className="size-3" /> Hybrid
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-500/5 text-slate-600 border border-slate-500/10 text-[9px] font-black uppercase tracking-widest">
            <MapPin className="size-3" /> On-Site
          </div>
        );
    }
  };

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <PageHeader
          title="Workforce Directory"
          description="Provision and manage centralized personnel records for distributed clusters."
        />
        <AddUserDialog
          managers={validManagers}
          departments={departments}
          locations={locations}
        />
      </div>

      <div className="premium-card shadow-xl border-border/40 overflow-hidden">
        <div className="px-6 py-5 bg-primary/2 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground leading-none mb-1">Personnel Records</h3>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">Interactive staff catalog</p>
            </div>
          </div>
          <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] bg-muted/20 px-3 py-1.5 rounded-full border border-border/20">
            {users.length} Identities Verified
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse">
            <thead className="bg-muted/5 border-b border-border/40">
              <tr>
                <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Employee Profile</th>
                <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Framework Role</th>
                <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Operational Mode</th>
                <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Primary Location</th>
                <th className="py-4 px-6 text-right font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Infrastructure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-primary/2 transition-colors group border-b border-border/10 last:border-0">
                  <td className="py-2.5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-black uppercase text-[11px] border border-primary/10 shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        {user.name ? user.name.slice(0, 2) : user.email.slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground leading-tight">{user.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium tracking-tight">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-6">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="py-2.5 px-6">
                    {getWorkModeBadge(user.workMode)}
                  </td>
                  <td className="py-2.5 px-6">
                    {user.location ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-foreground leading-none">{user.location.name}</span>
                        {user.location.isRemote && <span className="text-[9px] text-primary/70 font-black uppercase tracking-[0.15em] leading-none mt-1">Remote hub</span>}
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">Global Default</span>
                    )}
                  </td>
                  <td className="py-2.5 px-6 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <EditUserDialog
                        user={user}
                        managers={validManagers}
                        departments={departments}
                        locations={locations}
                      />
                      <DeleteUserButton id={user.id} />
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
