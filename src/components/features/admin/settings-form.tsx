"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Clock, Timer, CheckCircle, AlertCircle, Save, Loader2, 
  Settings2, ShieldAlert, CalendarRange, Workflow, ListOrdered
} from "lucide-react"
import { updateSystemConfig } from "@/actions/settings"
import { ShiftManagement } from "./shift-management"

interface SettingsFormProps {
  initialData: {
    officeStartTime: string;
    officeEndTime: string;
    graceTimeMinutes: number;
    lateMarkEnabled: boolean;
    lateMarkAllowedCount: number;
    specialCaseEnabled: boolean;
    specialCaseExtraMinutes: number;
    autoPunchOutEnabled: boolean;
    autoPunchOutDelayHours: number;
    autoPunchOutWarningThreshold: number;
    semiAnnualPolicyEnabled: boolean;
    semiAnnualCycleStartMonth: number;
    firstHalfEndTime: string;
    secondHalfStartTime: string;
    officeLat?: number;
    officeLng?: number;
    allowedRadiusMeters?: number;
  },
  initialShifts: any[];
}

export function SettingsForm({ initialData, initialShifts }: SettingsFormProps) {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 h-12 p-1 bg-muted/30">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Clock className="size-4" /> General & Timing
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <ShieldAlert className="size-4" /> Attendance Policies
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-2 text-xs">
            <CalendarRange className="size-4" /> Leave Policies
          </TabsTrigger>
          <TabsTrigger value="shifts" className="flex items-center gap-2 text-xs">
            <ListOrdered className="size-4" /> Shift Management
          </TabsTrigger>
        </TabsList>

        {/* --- GENERAL & TIMING TAB --- */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border/40 p-0 overflow-hidden">
              <CardHeader className="p-4 bg-muted/10 border-b border-border/40">
                <CardTitle className="text-base">Office Timing</CardTitle>
                <CardDescription className="text-xs text-muted-foreground/80">Global check-in and check-out schedule.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officeStartTime" className="text-xs">Shift Start</Label>
                    <Input
                      id="officeStartTime"
                      type="time"
                      value={formData.officeStartTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, officeStartTime: e.target.value }))}
                      className="h-9"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officeEndTime" className="text-xs">Shift End</Label>
                    <Input
                      id="officeEndTime"
                      type="time"
                      value={formData.officeEndTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, officeEndTime: e.target.value }))}
                      className="h-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graceTime" className="text-xs font-semibold flex items-center gap-1">
                    <Timer className="size-3" /> Grace Period (Minutes)
                  </Label>
                  <Input
                    id="graceTime"
                    type="number"
                    min="0"
                    value={formData.graceTimeMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, graceTimeMinutes: parseInt(e.target.value) || 0 }))}
                    className="h-9"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/40 p-0 overflow-hidden">
              <CardHeader className="p-4 bg-muted/10 border-b border-border/40">
                <CardTitle className="text-base">Geofencing</CardTitle>
                <CardDescription className="text-xs text-muted-foreground/80">Restrict punches to office vicinity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officeLat" className="text-xs text-muted-foreground/60 italic">Latitude</Label>
                    <Input
                      id="officeLat"
                      type="number"
                      step="any"
                      value={formData.officeLat ?? ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, officeLat: parseFloat(e.target.value) || undefined }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officeLng" className="text-xs text-muted-foreground/60 italic">Longitude</Label>
                    <Input
                      id="officeLng"
                      type="number"
                      step="any"
                      value={formData.officeLng ?? ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, officeLng: parseFloat(e.target.value) || undefined }))}
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius" className="text-xs">Radius (Meters)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={formData.allowedRadiusMeters ?? 500}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowedRadiusMeters: parseInt(e.target.value) || 0 }))}
                    className="h-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-[10px] h-8"
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
                  Fetch Local Lat/Lng
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- ATTENDANCE POLICIES TAB --- */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border/40 p-0 overflow-hidden">
              <CardHeader className="p-4 bg-muted/10 border-b border-border/40">
                <CardTitle className="text-base">Late Mark Rules</CardTitle>
                <CardDescription className="text-xs">Configure how delays are penalized.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Enable Late Mark Policy</Label>
                    <p className="text-[10px] text-muted-foreground/60 italic">Flag employees who exceed grace time.</p>
                  </div>
                  <Switch 
                    checked={formData.lateMarkEnabled} 
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lateMarkEnabled: checked }))}
                  />
                </div>
                
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <Label className="text-xs">Max Allowed Late Marks (Per Month)</Label>
                  <Input
                    type="number"
                    value={formData.lateMarkAllowedCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, lateMarkAllowedCount: parseInt(e.target.value) || 0 }))}
                    className="h-9"
                    disabled={!formData.lateMarkEnabled}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Special Case Logic</Label>
                      <p className="text-[10px] text-muted-foreground/60 italic">Waive late mark if shift hours are completed.</p>
                    </div>
                    <Switch 
                      checked={formData.specialCaseEnabled} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, specialCaseEnabled: checked }))}
                      disabled={!formData.lateMarkEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] text-muted-foreground">Extra Minutes Required</Label>
                    <Input
                      type="number"
                      value={formData.specialCaseExtraMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialCaseExtraMinutes: parseInt(e.target.value) || 0 }))}
                      className="h-9"
                      placeholder="e.g. 0 min"
                      disabled={!formData.lateMarkEnabled || !formData.specialCaseEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/40 p-0 overflow-hidden">
              <CardHeader className="p-4 bg-muted/10 border-b border-border/40">
                <CardTitle className="text-base">Automation Settings</CardTitle>
                <CardDescription className="text-xs">Manage system-triggered actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Enable Auto Punch-Out</Label>
                    <p className="text-[10px] text-muted-foreground/60 italic">Automatically close open sessions daily.</p>
                  </div>
                  <Switch 
                    checked={formData.autoPunchOutEnabled} 
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoPunchOutEnabled: checked }))}
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <Label className="text-[11px] text-muted-foreground">Delay (Hours after Shift End)</Label>
                  <Input
                    type="number"
                    value={formData.autoPunchOutDelayHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoPunchOutDelayHours: parseInt(e.target.value) || 0 }))}
                    className="h-9"
                    disabled={!formData.autoPunchOutEnabled}
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <Label className="text-[11px] text-muted-foreground">User Warning Threshold (Count)</Label>
                  <Input
                    type="number"
                    value={formData.autoPunchOutWarningThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoPunchOutWarningThreshold: parseInt(e.target.value) || 0 }))}
                    className="h-9"
                    disabled={!formData.autoPunchOutEnabled}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- LEAVE POLICIES TAB --- */}
        <TabsContent value="leave" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border/40 p-0 overflow-hidden">
              <CardHeader className="p-4 bg-muted/10 border-b border-border/40">
                <CardTitle className="text-base">Semi-Annual Leave Policy</CardTitle>
                <CardDescription className="text-xs">Configure the 6-month leave cycles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Enable semi-annual policy</Label>
                    <p className="text-[10px] text-muted-foreground/60 italic">Allow H1/H2 3-day leave blocks.</p>
                  </div>
                  <Switch 
                    checked={formData.semiAnnualPolicyEnabled} 
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, semiAnnualPolicyEnabled: checked }))}
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <Label className="text-xs font-semibold">Cycle Start Month</Label>
                  <Select 
                    value={(formData.semiAnnualCycleStartMonth ?? 4).toString()} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, semiAnnualCycleStartMonth: parseInt(val) }))}
                    disabled={!formData.semiAnnualPolicyEnabled}
                  >
                    <SelectTrigger className="h-9 bg-muted/5">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">January (Standard Year)</SelectItem>
                      <SelectItem value="4">April (Fiscal Year)</SelectItem>
                      <SelectItem value="7">July (Mid Year)</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/40 p-0 overflow-hidden">
              <CardHeader className="p-4 bg-muted/10 border-b border-border/40">
                <CardTitle className="text-base">Half-Day Settings</CardTitle>
                <CardDescription className="text-xs">Define boundaries for split shifts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">First Half End Time</Label>
                    <Input
                      type="time"
                      value={formData.firstHalfEndTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstHalfEndTime: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-amber-600 dark:text-amber-400 font-bold">Second Half Start Time</Label>
                    <Input
                      type="time"
                      value={formData.secondHalfStartTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondHalfStartTime: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-6 pt-2">
          <ShiftManagement initialShifts={initialShifts} />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-4">
        <div className="flex-1">
          {success && (
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-full w-fit animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-4 h-4" />
              Institutional policy updated successfully!
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-full w-fit animate-in shake duration-300">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 px-8 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Commit Policies
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
