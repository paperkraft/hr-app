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
      setError(res.error || "Failed to create user")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Add New Personnel</DialogTitle>
          <p className="text-xs text-muted-foreground italic">Provision a new account for the organization.</p>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input name="name" required className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email Address</Label>
              <Input type="email" name="email" required className="h-9" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <Label className="text-xs">Password</Label>
                <Input type="password" name="password" required className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Role</Label>
                <Select name="role" defaultValue="EMPLOYEE" required>
                    <SelectTrigger className="h-9 font-medium">
                    <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
            <div className="space-y-1">
              <Label className="text-xs">Work Mode</Label>
              <Select name="workMode" defaultValue="OFFICE">
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
              <Label className="text-xs">Assigned Office/Hub</Label>
              <Select name="locationId" defaultValue="none">
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
              <Label className="text-xs">Department</Label>
              <Select name="departmentId" defaultValue="none">
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select dept" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Manager</Label>
              <Select name="managerId" defaultValue="none">
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {managers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name || m.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-xs text-destructive font-medium bg-destructive/5 p-2 rounded border border-destructive/20">{error}</p>}
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Create Personnel Account
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
