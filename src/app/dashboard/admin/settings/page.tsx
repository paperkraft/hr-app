import { getSystemConfig, getLocations } from "@/actions/settings"
import { SettingsForm } from "@/components/features/admin/settings-form"
import { PageContainer, PageHeader } from "@/components/ui"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await getSystemConfig()
  const locations = await getLocations()

  return (
    <PageContainer maxWidth="full" className="py-8">
      <PageHeader 
        title="System Infrastructure"
        description="Institutional control panel for distributed workforce logistics, attendance policies, and global leave frameworks."
      />

      <div className="mt-8">
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
    </PageContainer>
  )
}
