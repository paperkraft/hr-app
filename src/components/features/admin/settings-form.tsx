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
  ShieldAlert, CalendarRange, ListOrdered, Globe
} from "lucide-react"
import { updateSystemConfig } from "@/actions/settings"
import { LocationManagement } from "./location-management"

interface SettingsFormProps {
  initialData: {
    defaultOfficeStartTime: string;
    defaultOfficeEndTime: string;
    defaultGraceTimeMinutes: number;
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
  },
  initialLocations: any[];
}

export function SettingsForm({ initialData, initialLocations }: SettingsFormProps) {
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
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8 h-12 p-1 bg-muted/30">
          <TabsTrigger value="general" className="flex items-center gap-2 text-[11px]">
            <Clock className="size-3.5" /> Defaults
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2 text-[11px]">
            <Globe className="size-3.5" /> Locations
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2 text-[11px]">
            <ShieldAlert className="size-3.5" /> Policies
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-2 text-[11px]">
            <CalendarRange className="size-3.5" /> Leave
          </TabsTrigger>
        </TabsList>

        {/* --- GENERAL DEFAULTS TAB --- */}
        <TabsContent value="general" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm border-border/40 p-0 overflow-hidden">
                        <CardHeader className="p-4 bg-muted/10 border-b border-border/40">
                            <CardTitle className="text-base text-primary">System Global Defaults</CardTitle>
                            <CardDescription className="text-xs">Baseline timings if no specific location/shift is assigned.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Default Start</Label>
                                    <Input
                                        type="time"
                                        value={formData.defaultOfficeStartTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, defaultOfficeStartTime: e.target.value }))}
                                        className="h-10"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Default End</Label>
                                    <Input
                                        type="time"
                                        value={formData.defaultOfficeEndTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, defaultOfficeEndTime: e.target.value }))}
                                        className="h-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                                    <Timer className="size-3" /> Standard Grace Period (Min)
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.defaultGraceTimeMinutes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, defaultGraceTimeMinutes: parseInt(e.target.value) || 0 }))}
                                    className="h-10"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/40 p-0 overflow-hidden flex flex-col justify-center items-center bg-primary/5 border-dashed border-2">
                        <div className="p-8 text-center space-y-2">
                            <Globe className="w-8 h-8 text-primary/40 mx-auto" />
                            <h3 className="font-bold text-sm">Distributed Workforce Mode</h3>
                            <p className="text-[11px] text-muted-foreground max-w-[200px]">Assign employees to specific office locations or remote modes in the User Directory.</p>
                        </div>
                    </Card>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border/40">
                    <div className="flex-1">
                        {success && (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-full w-fit animate-in fade-in zoom-in duration-300">
                                <CheckCircle className="w-4 h-4" /> Policy saved!
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-full w-fit animate-in shake duration-300">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}
                    </div>
                    <Button type="submit" disabled={loading} className="rounded-full px-6">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Global Defaults</>}
                    </Button>
                </div>
            </form>
        </TabsContent>

        {/* --- LOCATIONS TAB --- */}
        <TabsContent value="locations" className="space-y-6">
            <LocationManagement initialLocations={initialLocations} />
        </TabsContent>

        {/* --- ATTENDANCE POLICIES TAB --- */}
        <TabsContent value="attendance" className="space-y-6 text-xs">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading} className="rounded-full px-6">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Policies</>}
                    </Button>
                </div>
            </form>
        </TabsContent>

        {/* --- LEAVE POLICIES TAB --- */}
        <TabsContent value="leave" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading} className="rounded-full px-6">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Leave Policy</>}
                    </Button>
                </div>
            </form>
        </TabsContent>

      </Tabs>
    </div>
  )
}
