"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Loader2 } from "lucide-react"
import { updateUser } from "@/actions/user"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Employee: {user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input name="name" defaultValue={user.name || ""} required className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input type="email" name="email" defaultValue={user.email} required className="h-9" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
             <div className="space-y-1">
                <Label className="text-xs text-primary font-bold">Work Mode</Label>
                <Select name="workMode" defaultValue={user.workMode || "OFFICE"}>
                    <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="OFFICE">On-site (Office)</SelectItem>
                    <SelectItem value="REMOTE">Remote (WFH)</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-primary font-bold">Office/Hub Location</Label>
                <Select name="locationId" defaultValue={user.locationId || "none"}>
                    <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="none">Default Office</SelectItem>
                    {locations.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Role</Label>
              <Select name="role" defaultValue={user.role} required>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Department</Label>
              <Select name="departmentId" defaultValue={user.departmentId || "none"}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Dept" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-border/40">
            <Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Assign Manager</Label>
            <Select name="managerId" defaultValue={user.managerId || "none"}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top Level)</SelectItem>
                {managers.filter(m => m.id !== user.id).map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name || m.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Update Password (Optional)</Label>
            <Input type="password" name="password" placeholder="Leave blank to keep current" className="h-9" />
          </div>

          {error && <p className="text-xs text-destructive font-medium bg-destructive/5 p-2 rounded border border-destructive/20">{error}</p>}
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Update Employee Profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
