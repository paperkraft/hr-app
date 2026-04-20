"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Loader2, Save } from "lucide-react"
import { updateUser } from "@/actions/user"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const labelClass = "text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/80"
const inputClass = "h-8 w-full bg-muted border-border rounded-sm text-xs font-medium px-3 focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all outline-none placeholder:text-muted-foreground/30"
const selectTriggerClass = "h-8 w-full bg-muted border-border rounded-sm text-xs font-medium px-3 focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all outline-none shadow-none"

export function EditUserDialog({
  user,
  managers,
  departments,
  locations
}: {
  user: any,
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
      password: formData.get("password") || undefined,
      role: formData.get("role"),
      managerId: formData.get("managerId") === "none" ? null : formData.get("managerId"),
      departmentId: formData.get("departmentId") === "none" ? null : formData.get("departmentId"),
      locationId: formData.get("locationId") === "none" ? null : formData.get("locationId"),
      workMode: formData.get("workMode"),
    }

    const res = await updateUser(user.id, data as any)
    setLoading(false)

    if (res.success) {
      setOpen(false)
    } else {
      setError(res.error || "Failed to update user")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 rounded-sm border-border/60 shadow-lg overflow-hidden max-w-[520px]">
        {/* Dialog Header */}
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-sm font-bold tracking-tight">Update Profile</DialogTitle>
          <p className="text-[10px] text-muted-foreground/80 font-bold tracking-widest">
            Modifying credentials for {user.name}
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="p-4 space-y-2">
          {/* Identity */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/60 mb-2">Identity</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Full Name</Label>
                <Input name="name" defaultValue={user.name || ""} required className={inputClass} placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Email Address</Label>
                <Input type="email" name="email" defaultValue={user.email} required className={inputClass} placeholder="jane@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Password</Label>
                <Input type="password" name="password" className={inputClass} placeholder="Leave blank to keep" />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Role</Label>
                <Select name="role" defaultValue={user.role} required>
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
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/60 mb-2">Work Setup</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Work Mode</Label>
                <Select name="workMode" defaultValue={user.workMode || "OFFICE"}>
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
                <Select name="locationId" defaultValue={user.locationId || "none"}>
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
          <div className="pt-3 border-t border-border/30 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/60 mb-2">Organization</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Department</Label>
                <Select name="departmentId" defaultValue={user.departmentId || "none"}>
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
                <Label className={labelClass}>Reporting Manager</Label>
                <Select name="managerId" defaultValue={user.managerId || "none"}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm shadow-lg border-border/60">
                    <SelectItem value="none" className="text-xs">None (Top Level)</SelectItem>
                    {managers.filter(m => m.id !== user.id).map(m => (
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
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <><Save className="size-3.5 mr-1.5" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

