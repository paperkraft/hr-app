import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, MapPin, Globe, Laptop } from "lucide-react";
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
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground mt-1">Institutional workforce management for distributed teams.</p>
        </div>
        <AddUserDialog 
          managers={validManagers} 
          departments={departments} 
          locations={locations}
        />
      </div>

      <Card className="shadow-sm border-border/50 p-0">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/30">
                <tr className="border-b">
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Work Mode</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Location</th>
                  <th className="h-12 px-6 align-middle font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {users.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-2 px-6 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-medium text-muted-foreground uppercase text-xs">
                          {user.name ? user.name.slice(0, 2) : user.email.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{user.name}</span>
                          <span className="text-[10px] text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 px-6 align-middle">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-2 px-6 align-middle">
                      {getWorkModeBadge(user.workMode)}
                    </td>
                    <td className="p-2 px-6 align-middle">
                      {user.location ? (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">{user.location.name}</span>
                            {user.location.isRemote && <span className="text-[9px] text-blue-500 font-bold uppercase">Remote Hub</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic tracking-tight">Default Office</span>
                      )}
                    </td>
                    <td className="p-2 px-6 align-middle text-right">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
