"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Clock, Plus, Trash2, Edit2, CheckCircle2, Globe, Home, Crosshair, Save, X } from "lucide-react"
import { upsertLocation } from "@/actions/settings"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/ui"

interface Location {
  id: string;
  name: string;
  address?: string | null;
  startTime: string;
  endTime: string;
  lat?: number | null;
  lng?: number | null;
  radiusMeters: number;
  graceTimeMinutes: number;
  isRemote: boolean;
}

export function LocationManagement({ initialLocations }: { initialLocations: Location[] }) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<Partial<Location>>({
    name: "",
    startTime: "09:00",
    endTime: "18:00",
    radiusMeters: 500,
    graceTimeMinutes: 15,
    isRemote: false
  })

  const resetForm = () => {
    setFormData({ name: "", startTime: "09:00", endTime: "18:00", radiusMeters: 500, graceTimeMinutes: 15, isRemote: false })
    setEditingId(null)
    setIsAdding(false)
  }

  const handleEdit = (loc: Location) => {
    setFormData(loc)
    setEditingId(loc.id)
    setIsAdding(true)
  }

  const handleSave = async () => {
    setLoading(true)
    const result = await upsertLocation(formData as any)
    if (result.success) {
      if (editingId) {
        setLocations(prev => prev.map(l => l.id === editingId ? result.data : l))
      } else {
        setLocations(prev => [...prev, result.data])
      }
      resetForm()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Globe className="size-6 shadow-sm" />
           </div>
           <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Operational Clusters</h2>
              <p className="text-[10px] font-medium text-muted-foreground uppercase mt-1 tracking-tight opacity-70">Physical offices and verified remote hubs</p>
           </div>
        </div>
        {!isAdding && (
          <Button 
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95" 
            onClick={() => setIsAdding(true)}
          >
            <Plus className="size-4 mr-2" /> Register Site
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="premium-card shadow-2xl border-primary/20 bg-primary/[0.01] animate-in slide-in-from-top-4 duration-500 overflow-hidden">
          <div className="px-6 py-5 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
            <div>
               <h3 className="text-xs font-black uppercase tracking-widest">{editingId ? 'Modify Strategy' : 'Initialize New Cluster'}</h3>
               <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-0.5 opacity-60">Defining geofence parameters</p>
            </div>
            <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-primary/10" onClick={resetForm}>
               <X className="size-4" />
            </Button>
          </div>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Identity Vector (Location Name)</Label>
                <Input 
                   value={formData.name} 
                   onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} 
                   placeholder="e.g. London Tech Hub"
                   className="h-11 bg-background/50 border-border/40 focus:ring-primary/20 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Physical Address / Metadata</Label>
                <Input 
                   value={formData.address || ""} 
                   onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} 
                   placeholder="Verified Street Address"
                   className="h-11 bg-background/50 border-border/40 focus:ring-primary/20 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Cluster Start</Label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))} className="h-11 bg-background/50 border-border/40 rounded-xl font-mono font-bold" />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Cluster Termination</Label>
                <Input type="time" value={formData.endTime} onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))} className="h-11 bg-background/50 border-border/40 rounded-xl font-mono font-bold" />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Grace Delta (m)</Label>
                <Input type="number" value={formData.graceTimeMinutes} onChange={(e) => setFormData(p => ({ ...p, graceTimeMinutes: Number(e.target.value) }))} className="h-11 bg-background/50 border-border/40 rounded-xl font-bold" />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Radius Strategy (m)</Label>
                <Input type="number" value={formData.radiusMeters} onChange={(e) => setFormData(p => ({ ...p, radiusMeters: Number(e.target.value) }))} className="h-11 bg-background/50 border-border/40 rounded-xl font-bold" />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-primary/[0.03] rounded-3xl border border-primary/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-black uppercase tracking-tight">Decentralized Hub (Remote)</Label>
                  <Home className="size-3.5 text-primary/60" />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70 italic">Bypasses strict physical proximity verification.</p>
              </div>
              <Switch checked={formData.isRemote} onCheckedChange={(val) => setFormData(p => ({ ...p, isRemote: val }))} className="data-[state=checked]:bg-primary" />
            </div>

            {!formData.isRemote && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border border-border/40 rounded-3xl bg-muted/5 shadow-inner">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">Vector Latitude</Label>
                  <Input type="number" step="any" value={formData.lat || ""} onChange={(e) => setFormData(p => ({ ...p, lat: Number(e.target.value) }))} className="h-11 bg-background border-border/20 rounded-xl font-mono text-xs font-bold" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">Vector Longitude</Label>
                  <Input type="number" step="any" value={formData.lng || ""} onChange={(e) => setFormData(p => ({ ...p, lng: Number(e.target.value) }))} className="h-11 bg-background border-border/20 rounded-xl font-mono text-xs font-bold" />
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full text-[10px] font-black uppercase tracking-widest h-11 rounded-xl bg-background hover:bg-primary/10 hover:text-primary transition-all shadow-sm" 
                    type="button"
                    onClick={() => {
                      navigator.geolocation.getCurrentPosition(pos => {
                        setFormData(p => ({ ...p, lat: pos.coords.latitude, lng: pos.coords.longitude }))
                      })
                    }}
                  >
                    <Crosshair className="size-3.5 mr-2" /> Capture Coords
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-border/20">
              <Button variant="ghost" onClick={resetForm} className="text-xs font-black uppercase tracking-widest h-11 px-6 rounded-xl">Discard</Button>
              <Button onClick={handleSave} disabled={loading} className="h-11 px-8 bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                {loading ? 'Processing...' : <><Save className="size-4 mr-2" /> Commit Infrastructure</>}
              </Button>
            </div>
          </CardContent>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map(loc => (
          <div key={loc.id} className="premium-card shadow-xl hover:shadow-2xl transition-all border-border/40 overflow-hidden group border-b border-border/10 last:border-0 relative">
            <div className="px-5 py-4 flex items-center justify-between space-y-0 bg-primary/[0.02] border-b border-border/40 group-hover:bg-primary/[0.05] transition-colors">
              <div className="flex items-center gap-3">
                <div className={`size-8 rounded-xl flex items-center justify-center shadow-sm ${loc.isRemote ? 'bg-blue-500/10 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                   <MapPin className="size-4" />
                </div>
                <div>
                   <h3 className="text-[12px] font-black uppercase tracking-tight text-foreground">{loc.name}</h3>
                   <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Zone ID: {loc.id.slice(-4).toUpperCase()}</span>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-primary/10" onClick={() => handleEdit(loc)}>
                  <Edit2 className="size-3.5" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                  <Clock className="size-3.5" />
                  <span>{loc.startTime} — {loc.endTime}</span>
                </div>
                <StatusBadge 
                  status={loc.isRemote ? "info" : "success"} 
                  label={loc.isRemote ? 'Remote' : 'Verified'} 
                  size="sm" 
                  className="font-black uppercase text-[8px] tracking-[0.15em] px-2 h-5" 
                />
              </div>
              {!loc.isRemote && (
                 <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border border-border/20 rounded-xl">
                    <Crosshair className="size-3 text-emerald-500" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Radius: {loc.radiusMeters}m Geofence</span>
                 </div>
              )}
              <div className="text-[10px] font-medium text-muted-foreground bg-primary/[0.02] p-3 rounded-xl border border-primary/5 line-clamp-2 min-h-[48px] leading-relaxed" title={loc.address || ""}>
                {loc.address || "Global metadata not specified"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
