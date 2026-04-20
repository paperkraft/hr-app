"use client"

import { useState } from "react"
import { Users, Building2, Loader2 } from "lucide-react"
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
import { cn } from "@/lib/utils"

export function DepartmentList({
  departments,
  users
}: {
  departments: any[],
  users: { id: string, name: string | null, email: string }[]
}) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("Delete this department?")) return
    const res = await deleteDepartment(id)
    if (!res.success) {
      toast.error(res.error)
    } else {
      toast.success("Department deleted")
    }
  }

  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full border-collapse">
          <thead className="bg-muted/5 border-b border-border/40">
            <tr>
              <th className="py-3 px-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Department</th>
              <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Members</th>
              <th className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-muted/5 transition-colors group">
                {/* Department Name */}
                <td className="py-3 px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10 font-bold text-[9px]">
                      {dept.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-foreground leading-none">{dept.name}</p>
                      <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tight mt-0.5">
                        {dept._count?.members || 0} {dept._count?.members === 1 ? "member" : "members"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Member Count */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3 text-muted-foreground/30" />
                    <span className="text-[11px] font-bold text-foreground/70 tabular-nums">{dept._count?.members || 0}</span>
                  </div>
                </td>

                {/* Delete Action */}
                <td className="py-3 px-5 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/5 rounded-sm transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => handleDelete(dept.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </Button>
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <Building2 className="size-7" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No departments found</p>
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
