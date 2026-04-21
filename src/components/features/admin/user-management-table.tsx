"use client"

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui";
import { EditUserDialog } from "@/components/features/admin/edit-user-dialog";
import { DeleteUserButton } from "@/components/features/admin/delete-user-button";

interface UserManagementTableProps {
  initialUsers: any[];
  validManagers: any[];
  departments: any[];
  locations: any[];
}

export function UserManagementTable({
  initialUsers,
  validManagers,
  departments,
  locations
}: UserManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = initialUsers.filter((user) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchStr) ||
      user.email?.toLowerCase().includes(searchStr) ||
      user.department?.name?.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
          <Input
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 bg-muted/20 border-border/80 focus:ring-primary/20 rounded-sm text-xs"
          />
        </div>
      </div>

      {/* People Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse">
            <thead className="bg-muted/5 border-b border-border/60">
              <tr>
                <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 w-[300px]">Name</th>
                <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Joining Date</th>
                <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Department</th>
                <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
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
                        {user.joiningDate
                          ? new Date(user.joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold text-foreground/70 tracking-tight">
                        {user.department?.name || "Unassigned"}
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
                        <DeleteUserButton id={user.id} name={user.name} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-muted-foreground font-medium">
                    No matching employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
