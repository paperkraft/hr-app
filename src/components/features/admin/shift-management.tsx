"use client"

import { useState } from "react"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Plus, Trash2, Edit2, Loader2, Save, X, Users } from "lucide-react"
import { createShift, updateShift, deleteShift } from "@/actions/shift"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
            <Clock className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">Temporal Blueprints</h2>
            <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest leading-none mt-0.5">Infrastructure shift logic</p>
          </div>
        </div>
        {!isAdding && (
          <Button
            className="h-9 px-4 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm transition-colors"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="size-3.5 mr-1.5" /> Define Blueprint
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isAdding && (
          <div className="bg-card border border-primary/20 rounded-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest leading-none mb-0.5">Construct</h3>
                <p className="text-[9px] text-muted-foreground/50 font-black uppercase tracking-tight">Initializing bounds</p>
              </div>
              <Button variant="ghost" size="icon" className="size-7 rounded-sm hover:bg-primary/10" onClick={() => setIsAdding(false)}>
                <X className="size-3.5" />
              </Button>
            </div>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/50 tracking-widest px-1">Blueprint Identity</Label>
                <Input
                  placeholder="e.g. Standard Morning"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9 bg-muted/5 border-border/40 focus:ring-primary/10 rounded-sm font-bold text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground/50 tracking-widest px-1">Start Time</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="h-9 bg-muted/5 border-border/40 rounded-sm font-mono font-bold text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground/50 tracking-widest px-1">End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="h-9 bg-muted/5 border-border/40 rounded-sm font-mono font-bold text-xs"
                  />
                </div>
              </div>
              <Button className="w-full h-9 bg-primary text-[11px] font-bold uppercase tracking-widest rounded-sm mt-2" onClick={handleAdd} disabled={loading === "new"}>
                {loading === "new" ? <Loader2 className="size-3.5 animate-spin" /> : "Deploy Blueprint"}
              </Button>
            </CardContent>
          </div>
        )}

        {shifts.map((shift) => (
          <div key={shift.id} className="bg-card border border-border rounded-sm overflow-hidden group hover:border-border/80 transition-colors">
            <div className="px-5 py-3.5 flex items-center justify-between bg-muted/5 border-b border-border/40 group-hover:bg-primary/5 transition-colors">
              {editingId === shift.id ? (
                <Input
                  className="h-8 bg-background border-border/60 focus:ring-primary/10 rounded-sm text-xs font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground tracking-tight leading-none mb-0.5">{shift.name}</h3>
                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none">
                      ID: {shift.id.slice(-4).toUpperCase()}
                    </p>
                  </div>
                </div>
              )}
              {editingId !== shift.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <Button variant="ghost" size="icon" className="size-7 rounded-sm hover:bg-muted/10 text-muted-foreground" onClick={() => startEdit(shift)}>
                    <Edit2 className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <CardContent className="p-5">
              {editingId === shift.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Sync In</Label>
                      <Input
                        type="time"
                        className="h-9 bg-muted/5 border-border/40 rounded-sm font-mono font-bold text-xs"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Sync Out</Label>
                      <Input
                        type="time"
                        className="h-9 bg-muted/5 border-border/40 rounded-sm font-mono font-bold text-xs"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-primary rounded-sm font-bold uppercase tracking-widest text-[10px] h-9" onClick={() => handleUpdate(shift.id)} disabled={loading === shift.id}>
                      <Save className="size-3.5 mr-1.5" /> Commit
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1 rounded-sm font-bold uppercase tracking-widest text-[10px] h-9 border border-border" onClick={() => setEditingId(null)}>
                      Discard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-muted/5 border border-border/20 rounded-sm group-hover:bg-primary/5 transition-all">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-1">Start</span>
                      <span className="text-sm font-black text-foreground tabular-nums leading-none">{shift.startTime}</span>
                    </div>
                    <div className="h-4 w-px bg-border/40" />
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-1">End</span>
                      <span className="text-sm font-black text-foreground tabular-nums leading-none">{shift.endTime}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-sm bg-muted/10 text-muted-foreground/60 flex items-center justify-center border border-border/40">
                        <Users className="size-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground leading-none">{shift._count?.users || 0}</span>
                        <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mt-1">Personnel</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground/30 hover:text-rose-600 hover:bg-rose-500/10 transition-colors" onClick={() => handleDelete(shift.id)} disabled={loading === shift.id}>
                      {loading === shift.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    </Button>
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
