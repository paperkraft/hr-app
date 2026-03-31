import { getSystemConfig } from "@/actions/settings"
import { getShifts } from "@/actions/shift"
import { SettingsForm } from "@/components/features/admin/settings-form"
import { ShiftManagement } from "@/components/features/admin/shift-management"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await getSystemConfig()
  const { shifts = [] } = await getShifts()

  return (
    <div className="flex flex-col gap-12 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <div className="space-y-8">
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

      <div className="pt-8 border-t border-border/50">
        <ShiftManagement initialShifts={shifts} />
      </div>
    </div>
  )
}
