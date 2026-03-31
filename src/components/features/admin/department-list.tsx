"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, User as UserIcon, Trash2, Loader2 } from "lucide-react"
import { updateDepartmentLeader, deleteDepartment } from "@/actions/department"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function DepartmentList({
  departments,
  users
}: {
  departments: any[],
  users: { id: string, name: string | null, email: string }[]
}) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleLeaderChange(deptId: string, leaderId: string) {
    setLoading(deptId)
    const res = await updateDepartmentLeader(deptId, leaderId === "none" ? null : leaderId)
    setLoading(null)

    if (!res.success) {
      alert(res.error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this department?")) return

    const res = await deleteDepartment(id)
    if (!res.success) {
      alert(res.error)
    }
  }

  return (
    <Card className="shadow-sm border-border/50 p-0">
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-muted/30">
              <tr className="border-b">
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Department Name</th>
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Team Leader</th>
                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Members</th>
                <th className="h-12 px-6 align-middle font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {departments.map((dept) => (
                <tr key={dept.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 px-6 align-middle">
                    <span className="font-semibold text-foreground text-base">{dept.name}</span>
                  </td>
                  <td className="p-4 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <Select
                        defaultValue={dept.teamLeaderId || "none"}
                        onValueChange={(val) => handleLeaderChange(dept.id, val)}
                        disabled={loading === dept.id}
                      >
                        <SelectTrigger className="w-[240px] h-9">
                          <SelectValue placeholder="Select Leader" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Leader Assigned</SelectItem>
                          {users.map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {loading === dept.id && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    </div>
                  </td>
                  <td className="p-4 px-6 align-middle">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{dept._count?.members || 0} Employees</span>
                    </div>
                  </td>
                  <td className="p-4 px-6 align-middle text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => handleDelete(dept.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                    No departments found. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
