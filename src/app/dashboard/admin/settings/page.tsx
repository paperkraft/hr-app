import { getSystemConfig } from "@/actions/settings"
import { SettingsForm } from "@/components/features/admin/settings-form"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await getSystemConfig()

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Configuration</h1>
        <p className="text-muted-foreground mt-1">Institutional control panel for sigma framework.</p>
      </div>

      <SettingsForm initialData={{
        officeStartTime: config.officeStartTime,
        officeEndTime: config.officeEndTime,
        graceTimeMinutes: config.graceTimeMinutes,
        officeLat: config.officeLat ?? undefined,
        officeLng: config.officeLng ?? undefined,
        allowedRadiusMeters: config.allowedRadiusMeters
      }} />
    </div>
  )
}
