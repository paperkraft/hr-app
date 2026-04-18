"use client"

import { useState } from "react"
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
import { cn } from "@/lib/utils"

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

function SectionCard({ title, description, icon: Icon, iconColor = "text-primary", iconBg = "bg-primary/5", children }: {
    title: string;
    description: string;
    icon: React.ElementType;
    iconColor?: string;
    iconBg?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-border/60 rounded-sm shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3">
                <div className={cn("size-8 rounded-sm flex items-center justify-center border", iconBg, iconColor, "border-border/40")}>
                    <Icon className="size-4" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">{title}</h3>
                    <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.1em]">{description}</p>
                </div>
            </div>
            <div className="p-5 space-y-5">
                {children}
            </div>
        </div>
    )
}

function FieldRow({ label, children, disabled }: { label: string; children: React.ReactNode; disabled?: boolean }) {
    return (
        <div className={cn("space-y-1.5", disabled && "opacity-40 pointer-events-none")}>
            <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50">{label}</Label>
            {children}
        </div>
    )
}

function ToggleRow({ label, description, checked, onCheckedChange, disabled, color = "bg-primary" }: {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
    disabled?: boolean;
    color?: string;
}) {
    return (
        <div className={cn("flex items-center justify-between py-3 px-4 rounded-sm border border-border/40 bg-muted/5", disabled && "opacity-40")}>
            <div>
                <p className="text-xs font-bold text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground/50 font-medium mt-0.5">{description}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                className={`data-[state=checked]:${color}`}
            />
        </div>
    )
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

    const inputClass = "h-9 bg-muted/5 border-border/60 focus:ring-primary/10 rounded-sm font-mono text-xs"

    return (
        <div className="space-y-6 animate-fade-in">
            <Tabs defaultValue="general" className="w-full">
                {/* Tab Bar — TabsList with overriding classes to match design */}
                <TabsList className="flex items-center gap-1 p-1 bg-muted/30 border border-border/60 rounded-sm w-fit mb-6 h-auto overflow-x-auto scrollbar-hide">
                    <TabsTrigger value="general" className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-sm transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-border/80 data-[state=active]:shadow-sm text-muted-foreground/60 hover:text-foreground hover:bg-white/50">
                        <Clock className="size-3.5" /> Global Defaults
                    </TabsTrigger>
                    <TabsTrigger value="locations" className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-sm transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-border/80 data-[state=active]:shadow-sm text-muted-foreground/60 hover:text-foreground hover:bg-white/50">
                        <Globe className="size-3.5" /> Locations
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-sm transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-border/80 data-[state=active]:shadow-sm text-muted-foreground/60 hover:text-foreground hover:bg-white/50">
                        <ShieldAlert className="size-3.5" /> Attendance Policies
                    </TabsTrigger>
                    <TabsTrigger value="leave" className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-sm transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-border/80 data-[state=active]:shadow-sm text-muted-foreground/60 hover:text-foreground hover:bg-white/50">
                        <CalendarRange className="size-3.5" /> Leave Frameworks
                    </TabsTrigger>
                </TabsList>

                {/* ─── GLOBAL DEFAULTS ─── */}
                <TabsContent value="general" className="outline-none">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <SectionCard title="Global Defaults" description="Foundational shift logistics" icon={Clock}>
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldRow label="Shift Start">
                                        <Input
                                            type="time"
                                            value={formData.defaultOfficeStartTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, defaultOfficeStartTime: e.target.value }))}
                                            className={inputClass}
                                            required
                                        />
                                    </FieldRow>
                                    <FieldRow label="Shift End">
                                        <Input
                                            type="time"
                                            value={formData.defaultOfficeEndTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, defaultOfficeEndTime: e.target.value }))}
                                            className={inputClass}
                                            required
                                        />
                                    </FieldRow>
                                </div>
                                <FieldRow label="Grace Window (Minutes)">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.defaultGraceTimeMinutes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, defaultGraceTimeMinutes: parseInt(e.target.value) || 0 }))}
                                        className={inputClass}
                                        required
                                    />
                                </FieldRow>
                            </SectionCard>

                            <SectionCard title="Cloud-First Geofencing" description="Location-based attendance verification" icon={Globe} iconColor="text-sky-600" iconBg="bg-sky-500/5">
                                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                                    Our geofencing engine verifies every check-in against workstation parameters.
                                    Configure per-location radius under the <strong>Locations</strong> tab.
                                </p>
                                <div className="p-4 bg-sky-500/[0.02] border border-sky-500/10 rounded-sm">
                                    <p className="text-[10px] font-black text-sky-600/60 uppercase tracking-widest mb-1">Current Mode</p>
                                    <p className="text-xs font-bold text-foreground/70">Distributed Geofence · Per-location radius</p>
                                </div>
                            </SectionCard>
                        </div>

                        <SaveBar loading={loading} success={success} error={error} label="Save Defaults" />
                    </form>
                </TabsContent>

                {/* ─── LOCATIONS ─── */}
                <TabsContent value="locations" className="outline-none">
                    <LocationManagement initialLocations={initialLocations} />
                </TabsContent>

                {/* ─── ATTENDANCE POLICIES ─── */}
                <TabsContent value="attendance" className="outline-none">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            {/* Card 1: Late Mark Toggle + Threshold */}
                            <SectionCard title="Late Mark Enforcement" description="Threshold-based arrival penalties" icon={ShieldAlert} iconColor="text-amber-600" iconBg="bg-amber-500/5">
                                <ToggleRow
                                    label="Enable Late Marking"
                                    description="Monitor and flag late arrivals system-wide."
                                    checked={formData.lateMarkEnabled}
                                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, lateMarkEnabled: v }))}
                                />
                                <FieldRow label="Monthly Violation Limit" disabled={!formData.lateMarkEnabled}>
                                    <Input
                                        type="number"
                                        value={formData.lateMarkAllowedCount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, lateMarkAllowedCount: parseInt(e.target.value) || 0 }))}
                                        className={inputClass}
                                        disabled={!formData.lateMarkEnabled}
                                    />
                                </FieldRow>
                            </SectionCard>

                            {/* Card 2: Intelligent Waiver */}
                            <SectionCard title="Intelligent Waiver" description="Waive late mark on full-hour completion" icon={Timer} iconColor="text-emerald-600" iconBg="bg-emerald-500/5">
                                <ToggleRow
                                    label="Enable Waiver Rule"
                                    description="Waive late mark if total work hours meet target."
                                    checked={formData.specialCaseEnabled}
                                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, specialCaseEnabled: v }))}
                                    disabled={!formData.lateMarkEnabled}
                                />
                                <FieldRow label="Extra Minutes Allowed" disabled={!formData.lateMarkEnabled || !formData.specialCaseEnabled}>
                                    <Input
                                        type="number"
                                        value={formData.specialCaseExtraMinutes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specialCaseExtraMinutes: parseInt(e.target.value) || 0 }))}
                                        className={inputClass}
                                        placeholder="e.g. 0"
                                        disabled={!formData.lateMarkEnabled || !formData.specialCaseEnabled}
                                    />
                                </FieldRow>
                            </SectionCard>

                            {/* Card 3: Auto Check-Out */}
                            <SectionCard title="Auto Check-Out" description="Autonomous session lifecycle management" icon={ShieldAlert} iconColor="text-sky-600" iconBg="bg-sky-500/5">
                                <ToggleRow
                                    label="Enable Auto Check-Out"
                                    description="Terminate stale sessions at end of day."
                                    checked={formData.autoPunchOutEnabled}
                                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, autoPunchOutEnabled: v }))}
                                />
                                <FieldRow label="Post-Shift Grace (hrs)" disabled={!formData.autoPunchOutEnabled}>
                                    <Input
                                        type="number"
                                        value={formData.autoPunchOutDelayHours}
                                        onChange={(e) => setFormData(prev => ({ ...prev, autoPunchOutDelayHours: parseInt(e.target.value) || 0 }))}
                                        className={inputClass}
                                        disabled={!formData.autoPunchOutEnabled}
                                    />
                                </FieldRow>
                                <FieldRow label="Warning Threshold" disabled={!formData.autoPunchOutEnabled}>
                                    <Input
                                        type="number"
                                        value={formData.autoPunchOutWarningThreshold}
                                        onChange={(e) => setFormData(prev => ({ ...prev, autoPunchOutWarningThreshold: parseInt(e.target.value) || 0 }))}
                                        className={inputClass}
                                        disabled={!formData.autoPunchOutEnabled}
                                    />
                                </FieldRow>
                            </SectionCard>
                        </div>

                        <SaveBar loading={loading} success={success} error={error} label="Save Attendance Policies" />
                    </form>
                </TabsContent>

                {/* ─── LEAVE FRAMEWORKS ─── */}
                <TabsContent value="leave" className="outline-none">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            {/* Card 1: Semi-Annual Toggle */}
                            <SectionCard title="Semi-Annual Policy" description="H1/H2 leave cycle enforcement" icon={CalendarRange} iconColor="text-purple-600" iconBg="bg-purple-500/5">
                                <ToggleRow
                                    label="Enable Semi-Annual Rule"
                                    description="Enforce H1/H2 isolation and consecutive-only yearly leave."
                                    checked={formData.semiAnnualPolicyEnabled}
                                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, semiAnnualPolicyEnabled: v }))}
                                />
                            </SectionCard>

                            {/* Card 2: Cycle Start Month */}
                            <SectionCard title="Cycle Start Month" description="Fiscal year cycle anchor" icon={CalendarRange} iconColor="text-sky-600" iconBg="bg-sky-500/5">
                                <FieldRow label="Cycle Start Month" disabled={!formData.semiAnnualPolicyEnabled}>
                                    <Select
                                        value={(formData.semiAnnualCycleStartMonth ?? 4).toString()}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, semiAnnualCycleStartMonth: parseInt(val) }))}
                                        disabled={!formData.semiAnnualPolicyEnabled}
                                    >
                                        <SelectTrigger className="h-9 bg-muted/5 border-border/60 rounded-sm text-xs font-bold shadow-none">
                                            <SelectValue placeholder="Select start month" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-sm shadow-lg border-border/60">
                                            <SelectItem value="1" className="text-xs">January</SelectItem>
                                            <SelectItem value="4" className="text-xs">April (Fiscal Year)</SelectItem>
                                            <SelectItem value="7" className="text-xs">July (Mid-Year)</SelectItem>
                                            <SelectItem value="10" className="text-xs">October (Q4)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldRow>
                                <p className="text-[10px] text-muted-foreground/40 font-medium leading-snug">
                                    Defines when the first half of the leave cycle begins for all employees.
                                </p>
                            </SectionCard>

                            {/* Card 3: Half-Day Boundaries */}
                            <SectionCard title="Half-Day Boundaries" description="Session split configuration" icon={ListOrdered} iconColor="text-orange-600" iconBg="bg-orange-500/5">
                                <FieldRow label="First Half Ends At">
                                    <Input
                                        type="time"
                                        value={formData.firstHalfEndTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, firstHalfEndTime: e.target.value }))}
                                        className={inputClass}
                                    />
                                </FieldRow>
                                <FieldRow label="Second Half Starts At">
                                    <Input
                                        type="time"
                                        value={formData.secondHalfStartTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, secondHalfStartTime: e.target.value }))}
                                        className={inputClass}
                                    />
                                </FieldRow>
                            </SectionCard>
                        </div>

                        <SaveBar loading={loading} success={success} error={error} label="Save Leave Frameworks" />
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function SaveBar({ loading, success, error, label }: { loading: boolean; success: boolean; error: string | null; label: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white border border-border/60 rounded-sm shadow-sm">
            <div className="flex-1">
                {success && (
                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle className="size-3.5" />
                        Configuration saved successfully
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                        <AlertCircle className="size-3.5" />
                        {error}
                    </div>
                )}
            </div>
            <Button
                type="submit"
                disabled={loading}
                className="h-9 px-5 bg-primary hover:bg-primary/90 rounded-sm font-bold text-[11px] uppercase tracking-widest shadow-sm transition-all"
            >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <><Save className="size-3.5 mr-1.5" />{label}</>}
            </Button>
        </div>
    )
}
