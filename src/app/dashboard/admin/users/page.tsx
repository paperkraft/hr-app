import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { DeleteUserButton } from "@/components/admin/delete-user-button";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      manager: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const validManagers = await prisma.user.findMany({
    where: {
      role: { in: ['MANAGER', 'ADMIN'] }
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">ADMIN</Badge>;
      case "MANAGER":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">MANAGER</Badge>;
      case "ACCOUNTANT":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">ACCOUNTANT</Badge>;
      default:
        return <Badge variant="secondary" className="border-none">EMPLOYEE</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground mt-1">Manage all user accounts, roles, and manager assignments.</p>
        </div>
        <AddUserDialog managers={validManagers} />
      </div>

      <Card className="shadow-sm border-border/50 p-0">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/30">
                <tr className="border-b">
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Manager</th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Joined</th>
                  <th className="h-12 px-6 align-middle font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {users.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-6 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-medium text-muted-foreground uppercase">
                          {user.name ? user.name.slice(0, 2) : user.email.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 align-middle">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-6 align-middle">
                      {user.manager ? (
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{user.manager.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None (Top Level)</span>
                      )}
                    </td>
                    <td className="p-6 align-middle text-muted-foreground">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="p-6 align-middle text-right">
                      <DeleteUserButton id={user.id} />
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
