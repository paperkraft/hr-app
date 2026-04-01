"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Plus, Trash2, Edit2, Loader2, Save, X } from "lucide-react"
import { createShift, updateShift, deleteShift } from "@/actions/shift"
import { toast } from "sonner"

export function ShiftManagement({ initialShifts }: { initialShifts: any[] }) {
  const [shifts, setShifts] = useState(initialShifts)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({ name: "", startTime: "09:00", endTime: "18:00" })

  async function handleAdd() {
    setLoading("new")
    const res = await createShift(formData)
    if (res.success) {
      toast.success("Shift created successfully")
      setIsAdding(false)
      setFormData({ name: "", startTime: "09:00", endTime: "18:00" })
      // Page will revalidate, but we can also update local state if needed
      window.location.reload() 
    } else {
      toast.error(res.error)
    }
    setLoading(null)
  }

  async function handleUpdate(id: string) {
    setLoading(id)
    const res = await updateShift(id, formData)
    if (res.success) {
      toast.success("Shift updated successfully")
      setEditingId(null)
      window.location.reload()
    } else {
      toast.error(res.error)
    }
    setLoading(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return
    setLoading(id)
    const res = await deleteShift(id)
    if (!res.success) {
      toast.error(res.error)
    } else {
      toast.success("Shift deleted successfully")
      window.location.reload()
    }
    setLoading(null)
  }

  function startEdit(shift: any) {
    setEditingId(shift.id)
    setFormData({ name: shift.name, startTime: shift.startTime, endTime: shift.endTime })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shift Management</h2>
          <p className="text-muted-foreground">Define and manage employee working hours.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Shift
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isAdding && (
          <Card className="border-primary/50 shadow-md animate-in fade-in zoom-in duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">New Shift</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Shift Name</Label>
                <Input 
                  placeholder="e.g. Morning Shift" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input 
                    type="time" 
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input 
                    type="time" 
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 h-9" onClick={handleAdd} disabled={loading === "new"}>
                  {loading === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                </Button>
                <Button variant="outline" className="flex-1 h-9" onClick={() => setIsAdding(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {shifts.map((shift) => (
          <Card key={shift.id} className="transition-all hover:border-primary/30">
            <CardHeader className="pb-2">
              {editingId === shift.id ? (
                <Input 
                  className="font-bold h-7"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <CardTitle className="text-lg">{shift.name}</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {editingId === shift.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase">Start</Label>
                      <Input 
                        type="time" 
                        className="h-8"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase">End</Label>
                      <Input 
                        type="time" 
                        className="h-8"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handleUpdate(shift.id)} disabled={loading === shift.id}>
                      <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 p-2 rounded-md">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">{shift.startTime}</span>
                    <span className="text-xs">to</span>
                    <span className="font-medium text-foreground">{shift.endTime}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-muted-foreground">{shift._count?.users || 0} Employees</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(shift)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(shift.id)} disabled={loading === shift.id}>
                        {loading === shift.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
