"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Timer, CheckCircle, AlertCircle, Save, Loader2 } from "lucide-react"
import { updateSystemConfig } from "@/app/actions/settings"

interface SettingsFormProps {
  initialData: {
    officeStartTime: string;
    officeEndTime: string;
    graceTimeMinutes: number;
    officeLat?: number;
    officeLng?: number;
    allowedRadiusMeters?: number;
  }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateSystemConfig(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Timing Configuration Card */}
        <Card className="shadow-sm border-border/40 p-0">
          <CardHeader className="p-4">
            <CardTitle>Office Timing</CardTitle>
            <CardDescription>Global check-in and check-out schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-4">
            <div className="space-y-2">
              <Label htmlFor="officeStartTime">Shift Start Time</Label>
              <Input
                id="officeStartTime"
                type="time"
                value={formData.officeStartTime}
                onChange={(e) => setFormData(prev => ({ ...prev, officeStartTime: e.target.value }))}
                className="h-11 bg-muted/20 border-border focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="officeEndTime">Shift End Time</Label>
              <Input
                id="officeEndTime"
                type="time"
                value={formData.officeEndTime}
                onChange={(e) => setFormData(prev => ({ ...prev, officeEndTime: e.target.value }))}
                className="h-11 bg-muted/20 border-border focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2 pt-3 border-t border-border/40">
              <Label htmlFor="graceTime" className="text-sm font-semibold flex items-center gap-1">
                <Timer className="size-4" />
                Grace Period (Minutes)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="graceTime"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.graceTimeMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, graceTimeMinutes: parseInt(e.target.value) || 0 }))}
                  className="h-10"
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 italic mt-1">
                Employees punching in after {formData.officeStartTime} + {formData.graceTimeMinutes}m will be marked as "Late".
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 p-0">
          <CardHeader className="p-4">
            <CardTitle>Geofencing (Location tracking)</CardTitle>
            <CardDescription>Flag punches made outside the office radius.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officeLat">Office Latitude</Label>
                <Input
                  id="officeLat"
                  type="number"
                  step="any"
                  placeholder="e.g. 23.0225"
                  value={formData.officeLat ?? ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, officeLat: parseFloat(e.target.value) || undefined }))}
                  className="h-10 bg-muted/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officeLng">Office Longitude</Label>
                <Input
                  id="officeLng"
                  type="number"
                  step="any"
                  placeholder="e.g. 72.5714"
                  value={formData.officeLng ?? ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, officeLng: parseFloat(e.target.value) || undefined }))}
                  className="h-10 bg-muted/20"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                navigator.geolocation.getCurrentPosition((pos) => {
                  setFormData(prev => ({
                    ...prev,
                    officeLat: pos.coords.latitude,
                    officeLng: pos.coords.longitude
                  }))
                })
              }}
            >
              Set current location as Office
            </Button>

            <div className="space-y-2 pt-2">
              <Label htmlFor="radius">Allowed Radius (Meters)</Label>
              <Input
                id="radius"
                type="number"
                value={formData.allowedRadiusMeters ?? 500}
                onChange={(e) => setFormData(prev => ({ ...prev, allowedRadiusMeters: parseInt(e.target.value) || 0 }))}
                className="h-10 bg-muted/20"
              />
              <p className="text-[10px] text-muted-foreground/60 italic">
                Radius in meters. 500m is recommended for GPS drift.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <div className="flex-1">
          {success && (
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle className="w-5 h-5" />
              Configuration updated successfully!
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-10"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Configuration
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
