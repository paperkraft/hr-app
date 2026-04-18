"use client"

import { useState } from "react"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Plus, Trash2, Edit2, Loader2, Save, X, Users } from "lucide-react"
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
      toast.success("Operational shift initialized")
      setIsAdding(false)
      setFormData({ name: "", startTime: "09:00", endTime: "18:00" })
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
      toast.success("Shift parameters synchronized")
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
      toast.success("Shift decommissioned")
      window.location.reload()
    }
    setLoading(null)
  }

  function startEdit(shift: any) {
    setEditingId(shift.id)
    setFormData({ name: shift.name, startTime: shift.startTime, endTime: shift.endTime })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <Clock className="size-6 shadow-sm" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Temporal Blueprints</h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase mt-1 tracking-tight opacity-70">Infrastructure shift definitions and session logic</p>
          </div>
        </div>
        {!isAdding && (
          <Button
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="size-4 mr-2" /> Define Blueprint
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isAdding && (
          <div className="premium-card shadow-2xl border-primary/20 bg-primary/1 animate-in zoom-in duration-500 overflow-hidden">
            <div className="px-5 py-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest">Construct Blueprint</h3>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-0.5 opacity-60">Initializing session bounds</p>
              </div>
              <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-primary/10" onClick={() => setIsAdding(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Blueprint Identity</Label>
                <Input
                  placeholder="e.g. Standard Morning"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 bg-background/50 border-border/40 focus:ring-primary/20 rounded-xl font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Session Initiation</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="h-11 bg-background/50 border-border/40 rounded-xl font-mono font-bold"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Session Termination</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="h-11 bg-background/50 border-border/40 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 h-11 bg-primary font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20" onClick={handleAdd} disabled={loading === "new"}>
                  {loading === "new" ? <Loader2 className="size-4 animate-spin" /> : "Deploy Blueprint"}
                </Button>
              </div>
            </CardContent>
          </div>
        )}

        {shifts.map((shift) => (
          <div key={shift.id} className="premium-card shadow-xl hover:shadow-2xl transition-all border-border/40 overflow-hidden group border-b last:border-0 relative">
            <div className="px-5 py-4 flex items-center justify-between bg-primary/2 border-b border-border/40 group-hover:bg-primary/5 transition-colors">
              {editingId === shift.id ? (
                <Input
                  className="font-black uppercase tracking-tight h-9 bg-background focus:ring-primary/20 rounded-lg text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black uppercase tracking-tight text-foreground">{shift.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Blueprint ID: {shift.id.slice(-4).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}
              {editingId !== shift.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                  <Button variant="ghost" size="icon" className="size-7 rounded-sm hover:bg-primary/10" onClick={() => startEdit(shift)}>
                    <Edit2 className="size-3" />
                  </Button>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              {editingId === shift.id ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Sync Initiation</Label>
                      <Input
                        type="time"
                        className="h-10 bg-background/50 border-border/40 rounded-xl font-mono font-bold"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Sync Termination</Label>
                      <Input
                        type="time"
                        className="h-10 bg-background/50 border-border/40 rounded-xl font-mono font-bold"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-primary rounded-xl font-black uppercase tracking-widest text-[10px] h-10" onClick={() => handleUpdate(shift.id)} disabled={loading === shift.id}>
                      <Save className="size-3.5 mr-1.5" /> Commit
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] h-10" onClick={() => setEditingId(null)}>
                      Discard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/20 rounded-2xl shadow-inner group-hover:bg-primary/2 transition-all">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">Start</span>
                      <span className="text-sm font-black text-foreground tracking-tight">{shift.startTime}</span>
                    </div>
                    <div className="h-4 w-px bg-border/60" />
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">End</span>
                      <span className="text-sm font-black text-foreground tracking-tight">{shift.endTime}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <Users className="size-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-foreground leading-none">{shift._count?.users || 0}</span>
                        <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mt-1">Personnel</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-rose-600 hover:bg-rose-500/10 transition-all" onClick={() => handleDelete(shift.id)} disabled={loading === shift.id}>
                        {loading === shift.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        ))}
      </div>
    </div>
  )
}
