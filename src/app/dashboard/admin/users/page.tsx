import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
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
      shift: true
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

  const shifts = await prisma.shift.findMany({
    select: { id: true, name: true, startTime: true, endTime: true },
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

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground mt-1">Manage all user accounts, roles, and manager assignments.</p>
        </div>
        <AddUserDialog managers={validManagers} departments={departments} shifts={shifts} />
      </div>

      <Card className="shadow-sm border-border/50 p-0">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/30">
                <tr className="border-b">
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Department</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Shift</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Manager</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Joined</th>
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
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 px-6 align-middle">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-2 px-6 align-middle">
                      {user.department ? (
                        <span className="text-sm font-medium text-foreground">{user.department.name}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic tracking-tight">Unassigned</span>
                      )}
                    </td>
                    <td className="p-2 px-6 align-middle">
                      {user.shift ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">{user.shift.name}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {user.shift.startTime} - {user.shift.endTime}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic tracking-tight">Standard</span>
                      )}
                    </td>
                    <td className="p-2 px-6 align-middle">
                      {user.manager ? (
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-foreground">{user.manager.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic tracking-tight">None</span>
                      )}
                    </td>
                    <td className="p-2 px-6 align-middle text-muted-foreground text-xs">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="p-2 px-6 align-middle text-right">
                      <div className="flex justify-end gap-1">
                        <EditUserDialog 
                          user={user} 
                          managers={validManagers} 
                          departments={departments} 
                          shifts={shifts} 
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
