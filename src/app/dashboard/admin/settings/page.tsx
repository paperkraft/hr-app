import { getSystemConfig, getLocations } from "@/actions/settings"
import { SettingsForm } from "@/components/features/admin/settings-form"
import { PageContainer } from "@/components/ui"
import { Settings2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await getSystemConfig()
  const locations = await getLocations()

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">
      {/* Page Header — matches admin dashboard style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">System Configuration</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage attendance policies, locations, and leave frameworks</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border/60 bg-white text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest shadow-sm">
          <Settings2 className="size-3.5 text-primary/60" />
          Global Config
        </div>
      </div>

      <SettingsForm
        initialData={{
          defaultOfficeStartTime: config.defaultOfficeStartTime,
          defaultOfficeEndTime: config.defaultOfficeEndTime,
          defaultGraceTimeMinutes: config.defaultGraceTimeMinutes,
          lateMarkEnabled: config.lateMarkEnabled ?? true,
          lateMarkAllowedCount: config.lateMarkAllowedCount ?? 3,
          specialCaseEnabled: config.specialCaseEnabled ?? true,
          specialCaseExtraMinutes: config.specialCaseExtraMinutes ?? 0,
          autoPunchOutEnabled: config.autoPunchOutEnabled ?? true,
          autoPunchOutDelayHours: config.autoPunchOutDelayHours ?? 2,
          autoPunchOutWarningThreshold: config.autoPunchOutWarningThreshold ?? 3,
          semiAnnualPolicyEnabled: config.semiAnnualPolicyEnabled ?? true,
          semiAnnualCycleStartMonth: config.semiAnnualCycleStartMonth ?? 4,
          firstHalfEndTime: config.firstHalfEndTime ?? "13:30",
          secondHalfStartTime: config.secondHalfStartTime ?? "13:30",
        }}
        initialLocations={locations}
      />
    </PageContainer>
  )
}
