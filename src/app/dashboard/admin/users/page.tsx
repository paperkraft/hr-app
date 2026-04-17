import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Laptop } from "lucide-react";
import prisma from "@/lib/prisma";
import { AddUserDialog } from "@/components/features/admin/add-user-dialog";
import { EditUserDialog } from "@/components/features/admin/edit-user-dialog";
import { DeleteUserButton } from "@/components/features/admin/delete-user-button";

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
      role: { in: ['ADMIN', 'EMPLOYEE', 'ACCOUNTANT', 'SYSTEM_ADMIN'] }
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
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none uppercase text-[10px]">ADMIN</Badge>;
      case "ACCOUNTANT":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none uppercase text-[10px]">ACCOUNTANT</Badge>;
      default:
        return <Badge variant="secondary" className="border-none uppercase text-[10px]">EMPLOYEE</Badge>;
    }
  };

  const getWorkModeBadge = (mode: string) => {
    switch (mode) {
      case "REMOTE":
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-[10px] h-5 flex items-center gap-1">
          <Laptop className="w-2.5 h-2.5" /> REMOTE
        </Badge>;
      case "HYBRID":
        return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px] h-5 flex items-center gap-1">
          <Globe className="w-2.5 h-2.5" /> HYBRID
        </Badge>;
      default:
        return <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50 text-[10px] h-5 flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" /> ON-SITE
        </Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-10 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employee Directory</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Comprehensive workforce management for distributed teams.</p>
        </div>
        <AddUserDialog
          managers={validManagers}
          departments={departments}
          locations={locations}
        />
      </div>

      <Card className="shadow-sm border-border/40 p-0 overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/40 p-4">
          <CardTitle className="text-base text-primary">Personnel Records</CardTitle>
          <CardDescription className="text-xs">Active accounts currently provisioned in the system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/30 border-b border-border/40 py-2">
              <tr>
                <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Employee</th>
                <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Role</th>
                <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Work Mode</th>
                <th className="h-10 px-6 text-left align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Location</th>
                <th className="h-10 px-6 text-right align-middle font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/5 transition-colors duration-200">
                  <td className="p-3 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground uppercase text-[10px] border border-border/50">
                        {user.name ? user.name.slice(0, 2) : user.email.slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground leading-none">{user.name}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 px-6 align-middle">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="p-3 px-6 align-middle">
                    {getWorkModeBadge(user.workMode)}
                  </td>
                  <td className="p-3 px-6 align-middle">
                    {user.location ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-foreground">{user.location.name}</span>
                        {user.location.isRemote && <span className="text-[9px] text-primary/70 font-bold uppercase tracking-widest">Remote hub</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic font-medium">Default Office</span>
                    )}
                  </td>
                  <td className="p-3 px-6 align-middle text-right">
                    <div className="flex justify-end gap-1">
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
        </CardContent>
      </Card>
    </div>
  );
}
