import { getSystemConfig } from "@/app/actions/settings"
import { SettingsForm } from "@/components/admin/settings-form"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await getSystemConfig()

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto space-y-10">

      {/* Header Row */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground mt-1">Institutional control panel for sigma framework.</p>
        </div>
      </header>

      {/* Configuration Form wrapper */}
      <div className="space-y-10">
        <SettingsForm initialData={{
          officeStartTime: config.officeStartTime,
          officeEndTime: config.officeEndTime,
          graceTimeMinutes: config.graceTimeMinutes
        }} />
      </div>
    </div>
  )
}
