"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MapPin, Clock, Plus, Edit2, Crosshair, Save, X, Globe, Home } from "lucide-react"
import { upsertLocation } from "@/actions/settings"
import { cn } from "@/lib/utils"

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

const inputClass = "h-9 bg-muted/5 border-border/60 focus:ring-primary/10 rounded-sm font-mono text-xs"
const labelClass = "text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50"

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
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">Office Locations</h3>
          <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.1em]">Physical offices and remote hubs</p>
        </div>
        {!isAdding && (
          <Button
            className="h-9 px-4 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-all"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="size-3.5 mr-1.5" /> Add Location
          </Button>
        )}
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <div className="bg-white border border-border/60 rounded-sm shadow-sm overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">
                {editingId ? "Edit Location" : "New Location"}
              </h3>
              <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.1em]">Define geofence parameters</p>
            </div>
            <Button variant="ghost" size="icon" className="size-7 rounded-sm hover:bg-muted/10" onClick={resetForm}>
              <X className="size-3.5" />
            </Button>
          </div>

          <div className="p-5 space-y-5">
            {/* Name & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={labelClass}>Location Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Head Office"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Address</Label>
                <Input
                  value={formData.address || ""}
                  onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  placeholder="Street address"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Timings & Parameters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className={labelClass}>Start Time</Label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>End Time</Label>
                <Input type="time" value={formData.endTime} onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Grace (min)</Label>
                <Input type="number" value={formData.graceTimeMinutes} onChange={(e) => setFormData(p => ({ ...p, graceTimeMinutes: Number(e.target.value) }))} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Radius (m)</Label>
                <Input type="number" value={formData.radiusMeters} onChange={(e) => setFormData(p => ({ ...p, radiusMeters: Number(e.target.value) }))} className={inputClass} />
              </div>
            </div>

            {/* Remote Toggle */}
            <div className="flex items-center justify-between py-3 px-4 rounded-sm border border-border/40 bg-muted/5">
              <div className="flex items-center gap-2">
                <Home className="size-3.5 text-muted-foreground/40" />
                <div>
                  <p className="text-xs font-bold text-foreground">Remote Hub</p>
                  <p className="text-[10px] text-muted-foreground/50 font-medium mt-0.5">Bypasses physical proximity verification</p>
                </div>
              </div>
              <Switch
                checked={formData.isRemote ?? false}
                onCheckedChange={(val) => setFormData(p => ({ ...p, isRemote: val }))}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* GPS Coordinates (only if not remote) */}
            {!formData.isRemote && (
              <div className="p-4 border border-border/40 rounded-sm bg-muted/5 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50">GPS Coordinates</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Latitude</Label>
                    <Input type="number" step="any" value={formData.lat || ""} onChange={(e) => setFormData(p => ({ ...p, lat: Number(e.target.value) }))} className={inputClass} placeholder="e.g. 28.6139" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Longitude</Label>
                    <Input type="number" step="any" value={formData.lng || ""} onChange={(e) => setFormData(p => ({ ...p, lng: Number(e.target.value) }))} className={inputClass} placeholder="e.g. 77.2090" />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full h-9 text-[10px] font-bold uppercase tracking-widest rounded-sm border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
                      type="button"
                      onClick={() => {
                        navigator.geolocation.getCurrentPosition(pos => {
                          setFormData(p => ({ ...p, lat: pos.coords.latitude, lng: pos.coords.longitude }))
                        })
                      }}
                    >
                      <Crosshair className="size-3.5 mr-1.5" /> Use Current
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
              <Button variant="ghost" onClick={resetForm} className="h-9 px-4 text-xs font-bold uppercase tracking-widest rounded-sm">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading} className="h-9 px-5 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-all">
                {loading ? "Saving..." : <><Save className="size-3.5 mr-1.5" />{editingId ? "Update" : "Save Location"}</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Location Cards Grid */}
      {locations.length === 0 && !isAdding ? (
        <div className="bg-white border border-border/60 rounded-sm py-16 flex flex-col items-center gap-2 text-center opacity-30">
          <Globe className="size-7" />
          <p className="text-[10px] font-black uppercase tracking-widest">No locations configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map(loc => (
            <div key={loc.id} className="bg-white border border-border/60 rounded-sm shadow-sm overflow-hidden group hover:border-border transition-colors">
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between bg-muted/5">
                <div className="flex items-center gap-2.5">
                  <div className={cn("size-7 rounded-sm flex items-center justify-center border", loc.isRemote ? "bg-sky-500/5 text-sky-600 border-sky-500/10" : "bg-primary/5 text-primary border-primary/10")}>
                    <MapPin className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-foreground tracking-tight leading-none">{loc.name}</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tight mt-0.5">
                      #{loc.id.slice(-4).toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="size-7 rounded-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-muted/10"
                  onClick={() => handleEdit(loc)}
                >
                  <Edit2 className="size-3" />
                </Button>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60">
                    <Clock className="size-3" />
                    <span>{loc.startTime} — {loc.endTime}</span>
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm border",
                    loc.isRemote
                      ? "bg-sky-500/5 text-sky-600 border-sky-500/10"
                      : "bg-emerald-500/5 text-emerald-600 border-emerald-500/10"
                  )}>
                    {loc.isRemote ? "Remote" : "On-site"}
                  </span>
                </div>

                {!loc.isRemote && (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/5 border border-border/40 rounded-sm">
                    <Crosshair className="size-2.5 text-muted-foreground/30" />
                    <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">{loc.radiusMeters}m radius · {loc.graceTimeMinutes}min grace</span>
                  </div>
                )}

                {loc.address && (
                  <p className="text-[10px] text-muted-foreground/50 font-medium leading-snug line-clamp-2">
                    {loc.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
