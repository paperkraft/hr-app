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

import { toast } from "sonner"

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
      toast.error(res.error)
    } else {
      toast.success("Team leader updated successfully")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this department?")) return

    const res = await deleteDepartment(id)
    if (!res.success) {
      toast.error(res.error)
    } else {
      toast.success("Department deleted")
    }
  }

  return (
    <div className="premium-card shadow-xl border-border/40 overflow-hidden animate-fade-in">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full border-collapse">
          <thead className="bg-muted/5 border-b border-border/40">
            <tr>
              <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Department Name</th>
              <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Team Leadership</th>
              <th className="py-4 px-6 text-left font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Operational Pulse</th>
              <th className="py-4 px-6 text-right font-black text-muted-foreground/70 text-[10px] uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-primary/[0.02] transition-colors group">
                <td className="py-3 px-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground leading-none mb-1">{dept.name}</span>
                    <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">Functional Unit</span>
                  </div>
                </td>
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <Select
                      defaultValue={dept.teamLeaderId || "none"}
                      onValueChange={(val) => handleLeaderChange(dept.id, val)}
                      disabled={loading === dept.id}
                    >
                      <SelectTrigger className="w-[260px] h-10 bg-muted/10 border-border/40 focus:ring-primary/20 rounded-xl text-xs font-bold transition-all shadow-none">
                        <SelectValue placeholder="Select Deployment Leader" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl">
                        <SelectItem value="none" className="text-xs font-medium">None Assigned</SelectItem>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id} className="text-xs font-medium">{u.name || u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {loading === dept.id && <Loader2 className="size-4 animate-spin text-primary" />}
                  </div>
                </td>
                <td className="py-3 px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                       <Users className="size-4" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-foreground leading-none">{dept._count?.members || 0}</span>
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-1">Identities</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-6 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground/40 hover:text-rose-600 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => handleDelete(dept.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                     <Building2 className="size-12 mb-2 text-muted-foreground" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">No clusters found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
