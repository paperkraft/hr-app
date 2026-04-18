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
    <div className="space-y-8 animate-fade-in">
        <Tabs defaultValue="general" className="w-full">
            <div className="relative mb-10 overflow-x-auto scrollbar-hide">
                <TabsList className="flex w-fit min-w-full justify-start gap-1 p-1.5 bg-muted/20 border border-border/40 rounded-2xl h-14">
                    <TabsTrigger value="general" className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 rounded-xl border border-transparent data-[state=active]:border-border/40">
                        <Clock className="size-4" /> Global Defaults
                    </TabsTrigger>
                    <TabsTrigger value="locations" className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 rounded-xl border border-transparent data-[state=active]:border-border/40">
                        <Globe className="size-4" /> Locations & Geofencing
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 rounded-xl border border-transparent data-[state=active]:border-border/40">
                        <ShieldAlert className="size-4" /> Operation Policies
                    </TabsTrigger>
                    <TabsTrigger value="leave" className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 rounded-xl border border-transparent data-[state=active]:border-border/40">
                        <CalendarRange className="size-4" /> Leave Frameworks
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* --- GENERAL DEFAULTS TAB --- */}
            <TabsContent value="general" className="space-y-8 outline-none">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="premium-card shadow-xl border-border/40 overflow-hidden">
                            <CardHeader className="p-6 bg-primary/2 border-b border-border/40">
                                <div className="flex items-center gap-3">
                                   <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                      <Clock className="size-5" />
                                   </div>
                                   <div>
                                      <CardTitle className="text-sm font-black uppercase tracking-widest">Global Defaults</CardTitle>
                                      <CardDescription className="text-[11px] font-medium mt-1">Foundational logistics for operations.</CardDescription>
                                   </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Shift Start</Label>
                                        <Input
                                            type="time"
                                            value={formData.defaultOfficeStartTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, defaultOfficeStartTime: e.target.value }))}
                                            className="h-11 bg-muted/10 border-border/40 focus:ring-primary/20 rounded-xl font-mono text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Shift End</Label>
                                        <Input
                                            type="time"
                                            value={formData.defaultOfficeEndTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, defaultOfficeEndTime: e.target.value }))}
                                            className="h-11 bg-muted/10 border-border/40 focus:ring-primary/20 rounded-xl font-mono text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1 flex items-center gap-2">
                                        <Timer className="size-3.5" /> Grace Window (Minutes)
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.defaultGraceTimeMinutes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, defaultGraceTimeMinutes: parseInt(e.target.value) || 0 }))}
                                        className="h-11 bg-muted/10 border-border/40 focus:ring-primary/20 rounded-xl font-bold"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="premium-card shadow-xl border-dashed border-2 border-primary/20 bg-primary/2 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
                               <Globe className="size-8 text-primary shadow-sm" />
                            </div>
                            <div>
                                <h3 className="text-base font-black uppercase tracking-widest text-foreground">Cloud-First Geofencing</h3>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-[280px] font-medium">
                                    Our geofencing engine verifies every punch against workstation parameters. Set per-location radius in the next tab.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-6 flex items-center justify-between p-6 bg-background/80 backdrop-blur-xl border border-border/40 rounded-3xl shadow-2xl z-10">
                        <div className="flex-1">
                            {success && (
                                <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-500/10 px-6 py-2.5 rounded-full w-fit animate-in fade-in slide-in-from-left-4 duration-500">
                                    <CheckCircle className="size-4" /> Configuration Applied
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-3 text-rose-600 font-black text-[10px] uppercase tracking-widest bg-rose-500/10 px-6 py-2.5 rounded-full w-fit animate-in shake duration-500">
                                    <AlertCircle className="size-4" /> {error}
                                </div>
                            )}
                        </div>
                        <Button type="submit" disabled={loading} size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-2" /> Commit Changes</>}
                        </Button>
                    </div>
                </form>
            </TabsContent>

            {/* --- LOCATIONS TAB --- */}
            <TabsContent value="locations" className="outline-none">
                <LocationManagement initialLocations={initialLocations} />
            </TabsContent>

            {/* --- ATTENDANCE POLICIES TAB --- */}
            <TabsContent value="attendance" className="space-y-8 outline-none text-xs">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="premium-card shadow-xl border-border/40">
                            <CardHeader className="p-6 bg-primary/2 border-b border-border/40">
                                <div className="flex items-center gap-3">
                                   <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                      <ShieldAlert className="size-5" />
                                   </div>
                                   <div>
                                      <CardTitle className="text-sm font-black uppercase tracking-widest">Late Marking Engine</CardTitle>
                                      <CardDescription className="text-[11px] font-medium mt-1">Configure threshold-based penalties.</CardDescription>
                                   </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border/20">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-foreground">Global Enforcement</Label>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">Monitor workforce arrivals.</p>
                                    </div>
                                    <Switch
                                        checked={formData.lateMarkEnabled}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lateMarkEnabled: checked }))}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Monthly Violation Threshold</Label>
                                    <Input
                                        type="number"
                                        value={formData.lateMarkAllowedCount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, lateMarkAllowedCount: parseInt(e.target.value) || 0 }))}
                                        className="h-11 bg-muted/10 border-border/40 rounded-xl font-bold"
                                        disabled={!formData.lateMarkEnabled}
                                    />
                                </div>

                                <div className="pt-6 border-t border-border/40 space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-primary/3 rounded-2xl border border-primary/10">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold text-foreground">Intelligent Waiver</Label>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">Waive late if total hours hit target.</p>
                                        </div>
                                        <Switch
                                            checked={formData.specialCaseEnabled}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, specialCaseEnabled: checked }))}
                                            disabled={!formData.lateMarkEnabled}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Bonus Minutes Delta</Label>
                                        <Input
                                            type="number"
                                            value={formData.specialCaseExtraMinutes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, specialCaseExtraMinutes: parseInt(e.target.value) || 0 }))}
                                            className="h-11 bg-muted/10 border-border/40 rounded-xl font-bold"
                                            placeholder="e.g. 0 min"
                                            disabled={!formData.lateMarkEnabled || !formData.specialCaseEnabled}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="premium-card shadow-xl border-border/40">
                            <CardHeader className="p-6 bg-primary/2 border-b border-border/40">
                                <div className="flex items-center gap-3">
                                   <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                      <Timer className="size-5" />
                                   </div>
                                   <div>
                                      <CardTitle className="text-sm font-black uppercase tracking-widest">System Orchestration</CardTitle>
                                      <CardDescription className="text-[11px] font-medium mt-1">Autonomous lifecycle management.</CardDescription>
                                   </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border/20">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-foreground">Auto-Exit Sequence</Label>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">Terminate stale sessions daily.</p>
                                    </div>
                                    <Switch
                                        checked={formData.autoPunchOutEnabled}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoPunchOutEnabled: checked }))}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>

                                <div className="space-y-6 pt-6 border-t border-border/40">
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Grace Delta (Post-Shift Hours)</Label>
                                        <Input
                                            type="number"
                                            value={formData.autoPunchOutDelayHours}
                                            onChange={(e) => setFormData(prev => ({ ...prev, autoPunchOutDelayHours: parseInt(e.target.value) || 0 }))}
                                            className="h-11 bg-muted/10 border-border/40 rounded-xl font-bold"
                                            disabled={!formData.autoPunchOutEnabled}
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Intelligence Threshold (Alerts)</Label>
                                        <Input
                                            type="number"
                                            value={formData.autoPunchOutWarningThreshold}
                                            onChange={(e) => setFormData(prev => ({ ...prev, autoPunchOutWarningThreshold: parseInt(e.target.value) || 0 }))}
                                            className="h-11 bg-muted/10 border-border/40 rounded-xl font-bold"
                                            disabled={!formData.autoPunchOutEnabled}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="flex justify-end p-6 bg-background rounded-3xl border border-border/40 shadow-xl">
                        <Button type="submit" disabled={loading} size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-2" /> Synchonize Policies</>}
                        </Button>
                    </div>
                </form>
            </TabsContent>

            {/* --- LEAVE POLICIES TAB --- */}
            <TabsContent value="leave" className="space-y-8 outline-none">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="premium-card shadow-xl border-border/40">
                            <CardHeader className="p-6 bg-primary/2 border-b border-border/40">
                                <div className="flex items-center gap-3">
                                   <div className="size-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                      <CalendarRange className="size-5" />
                                   </div>
                                   <div>
                                      <CardTitle className="text-sm font-black uppercase tracking-widest">Cyclical Frameworks</CardTitle>
                                      <CardDescription className="text-[11px] font-medium mt-1">Multi-cycle balance resets.</CardDescription>
                                   </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-8 p-6">
                                <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border/20">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-foreground">Semi-Annual Enforcement</Label>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">Enforce H1/H2 isolation rules.</p>
                                    </div>
                                    <Switch
                                        checked={formData.semiAnnualPolicyEnabled}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, semiAnnualPolicyEnabled: checked }))}
                                        className="data-[state=checked]:bg-purple-600"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest px-1">Infrastructure Cycle Start</Label>
                                    <Select
                                        value={(formData.semiAnnualCycleStartMonth ?? 4).toString()}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, semiAnnualCycleStartMonth: parseInt(val) }))}
                                        disabled={!formData.semiAnnualPolicyEnabled}
                                    >
                                        <SelectTrigger className="h-11 bg-muted/10 border-border/40 rounded-xl font-bold shadow-none">
                                            <SelectValue placeholder="Select Deployment Month" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-2xl">
                                            <SelectItem value="1" className="text-sm font-medium">January (Global Standard)</SelectItem>
                                            <SelectItem value="4" className="text-sm font-medium">April (Fiscal Strategy)</SelectItem>
                                            <SelectItem value="7" className="text-sm font-medium">July (Operational Mid-Point)</SelectItem>
                                            <SelectItem value="10" className="text-sm font-medium">October (Quarterly Focus)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="premium-card shadow-xl border-border/40">
                            <CardHeader className="p-6 bg-primary/2 border-b border-border/40">
                                <div className="flex items-center gap-3">
                                   <div className="size-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                                      <ListOrdered className="size-5" />
                                   </div>
                                   <div>
                                      <CardTitle className="text-sm font-black uppercase tracking-widest">Half-Day Boundaries</CardTitle>
                                      <CardDescription className="text-[11px] font-medium mt-1">Define operational session splits.</CardDescription>
                                   </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-8 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] uppercase font-black text-emerald-600/70 tracking-widest px-1">Session A Termination</Label>
                                        <Input
                                            type="time"
                                            value={formData.firstHalfEndTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, firstHalfEndTime: e.target.value }))}
                                            className="h-11 bg-emerald-500/3 border-emerald-500/20 focus:ring-emerald-500/20 rounded-xl font-mono text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] uppercase font-black text-amber-600/70 tracking-widest px-1">Session B Initiation</Label>
                                        <Input
                                            type="time"
                                            value={formData.secondHalfStartTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, secondHalfStartTime: e.target.value }))}
                                            className="h-11 bg-amber-500/3 border-amber-500/20 focus:ring-amber-500/20 rounded-xl font-mono text-sm font-bold"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="flex justify-end p-6 bg-background rounded-3xl border border-border/40 shadow-xl">
                        <Button type="submit" disabled={loading} size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-2" /> Authenticate Changes</>}
                        </Button>
                    </div>
                </form>
            </TabsContent>
        </Tabs>
    </div>
    )
}
