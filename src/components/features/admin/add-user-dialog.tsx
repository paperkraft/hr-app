"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2 } from "lucide-react"
import { createUser } from "@/actions/user"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const labelClass = "text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50"
const inputClass = "h-9 bg-muted/5 border-border/60 rounded-sm text-xs font-medium focus:ring-primary/10"
const selectTriggerClass = "h-9 bg-muted/5 border-border/60 rounded-sm text-xs font-medium shadow-none focus:ring-primary/10"

export function AddUserDialog({
  managers,
  departments,
  locations
}: {
  managers: { id: string, name: string | null, email: string }[],
  departments: { id: string, name: string }[],
  locations: { id: string, name: string, isRemote: boolean }[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      managerId: formData.get("managerId") === "none" ? null : formData.get("managerId"),
      departmentId: formData.get("departmentId") === "none" ? null : formData.get("departmentId"),
      locationId: formData.get("locationId") === "none" ? null : formData.get("locationId"),
      workMode: formData.get("workMode"),
    }

    const res = await createUser(data as any)
    setLoading(false)

    if (res.success) {
      setOpen(false)
    } else {
      setError(res.error || "Failed to create employee")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 px-4 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-all">
          <UserPlus className="size-3.5 mr-1.5" /> Add Employee
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 rounded-sm border-border/60 shadow-lg overflow-hidden max-w-[520px]">
        {/* Dialog Header */}
        <DialogHeader className="px-5 py-4 border-b border-border/40">
          <DialogTitle className="text-sm font-bold tracking-tight">New Employee</DialogTitle>
          <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.1em] mt-0.5">
            Provision a new account for the organization
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {/* Identity */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/30 mb-2">Identity</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Full Name</Label>
                <Input name="name" required className={inputClass} placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Email Address</Label>
                <Input type="email" name="email" required className={inputClass} placeholder="jane@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Password</Label>
                <Input type="password" name="password" required className={inputClass} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Role</Label>
                <Select name="role" defaultValue="EMPLOYEE" required>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm shadow-lg border-border/60">
                    <SelectItem value="EMPLOYEE" className="text-xs">Employee</SelectItem>
                    <SelectItem value="ACCOUNTANT" className="text-xs">Accountant</SelectItem>
                    <SelectItem value="ADMIN" className="text-xs">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Work Setup */}
          <div className="pt-3 border-t border-border/30">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/30 mb-2">Work Setup</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Work Mode</Label>
                <Select name="workMode" defaultValue="OFFICE">
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm shadow-lg border-border/60">
                    <SelectItem value="OFFICE" className="text-xs">On-site</SelectItem>
                    <SelectItem value="REMOTE" className="text-xs">Remote</SelectItem>
                    <SelectItem value="HYBRID" className="text-xs">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Office / Hub</Label>
                <Select name="locationId" defaultValue="none">
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm shadow-lg border-border/60">
                    <SelectItem value="none" className="text-xs">Default Office</SelectItem>
                    {locations.map(l => (
                      <SelectItem key={l.id} value={l.id} className="text-xs">{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="pt-3 border-t border-border/30">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/30 mb-2">Organization</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Department</Label>
                <Select name="departmentId" defaultValue="none">
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm shadow-lg border-border/60">
                    <SelectItem value="none" className="text-xs">None</SelectItem>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Manager</Label>
                <Select name="managerId" defaultValue="none">
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm shadow-lg border-border/60">
                    <SelectItem value="none" className="text-xs">None</SelectItem>
                    {managers.map(m => (
                      <SelectItem key={m.id} value={m.id} className="text-xs">{m.name || m.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest px-1">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/30">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-9 text-xs font-bold uppercase tracking-widest rounded-sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-9 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <><UserPlus className="size-3.5 mr-1.5" /> Create Employee</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
