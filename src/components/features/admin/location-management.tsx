"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Plus, Trash2, Edit2, CheckCircle2, Globe, Home, Crosshair } from "lucide-react"
import { upsertLocation } from "@/actions/settings"
import { Switch } from "@/components/ui/switch"

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Office Locations & Work Sites
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Define physical offices and remote hubs with specific geofences.</p>
        </div>
        <Button className="h-10 px-5" onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" /> Add Location
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/20 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-base">{editingId ? 'Edit Location' : 'New Office Site'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Bangalore Headquarters" />
              </div>
              <div className="space-y-2">
                <Label>Address (Optional)</Label>
                <Input value={formData.address || ""} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} placeholder="Full street address" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={formData.endTime} onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Grace Period (Min)</Label>
                <Input type="number" value={formData.graceTimeMinutes} onChange={(e) => setFormData(p => ({ ...p, graceTimeMinutes: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Geofence Radius (m)</Label>
                <Input type="number" value={formData.radiusMeters} onChange={(e) => setFormData(p => ({ ...p, radiusMeters: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/40">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-bold capitalize">Remote/Co-working Hub</Label>
                  <Home className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground italic">If enabled, physical geofencing will be bypassed for this site.</p>
              </div>
              <Switch checked={formData.isRemote} onCheckedChange={(val) => setFormData(p => ({ ...p, isRemote: val }))} />
            </div>

            {!formData.isRemote && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-background">
                <div className="space-y-2">
                  <Label className="text-xs">Latitude</Label>
                  <Input type="number" step="any" value={formData.lat || ""} onChange={(e) => setFormData(p => ({ ...p, lat: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Longitude</Label>
                  <Input type="number" step="any" value={formData.lng || ""} onChange={(e) => setFormData(p => ({ ...p, lng: Number(e.target.value) }))} />
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full text-xs h-9" 
                    type="button"
                    onClick={() => {
                      navigator.geolocation.getCurrentPosition(pos => {
                        setFormData(p => ({ ...p, lat: pos.coords.latitude, lng: pos.coords.longitude }))
                      })
                    }}
                  >
                    <Crosshair className="w-3 h-3 mr-2" /> Capture Current
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Location'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map(loc => (
          <Card key={loc.id} className="shadow-sm hover:shadow-md transition-all border-border/40 overflow-hidden group">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 bg-muted/5 group-hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${loc.isRemote ? 'text-blue-500' : 'text-primary'}`} />
                <CardTitle className="text-sm font-bold">{loc.name}</CardTitle>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(loc)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{loc.startTime} - {loc.endTime}</span>
                </div>
                <Badge variant="secondary" className="text-[9px] pointer-events-none">
                  {loc.isRemote ? 'Remote' : `${loc.radiusMeters}m Geofence`}
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground bg-muted/20 p-2 rounded truncate" title={loc.address || ""}>
                {loc.address || "No address provided"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
