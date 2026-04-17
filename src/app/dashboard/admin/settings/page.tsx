import { getSystemConfig, getLocations } from "@/actions/settings"
import { SettingsForm } from "@/components/features/admin/settings-form"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await getSystemConfig()
  const locations = await getLocations()

  return (
    <div className="flex flex-col gap-12 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">System Configuration</h1>
          <p className="text-muted-foreground mt-1">Institutional control panel for distributed workforce & global policies.</p>
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
      </div>
    </div>
  )
}
