import { getSystemConfig } from "@/app/actions/settings"
import { SettingsForm } from "@/components/admin/settings-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Settings, Info, ShieldCheck, Mail, Users, Bell } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await getSystemConfig()

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">

      {/* Header Row */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground/90">
            System <span className="text-foreground">Configuration</span>
          </h2>
          <p className="text-sm font-medium text-muted-foreground/40 font-sans tracking-tight uppercase tracking-widest text-[10px] font-black">Institutional control panel for nexus framework</p>
        </div>
      </header>

      {/* Configuration Form wrapper */}
      <div className="space-y-10">
        <div className="space-y-4">
          <h3 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 font-sans">Policy Controls</h3>
          <SettingsForm initialData={{
            officeStartTime: config.officeStartTime,
            officeEndTime: config.officeEndTime,
            graceTimeMinutes: config.graceTimeMinutes
          }} />
        </div>
      </div>
    </div>
  )
}
