import { getSystemConfig, getLocations } from "@/actions/settings"
import { getHolidays } from "@/actions/holiday"
import { getDepartments } from "@/actions/department"
import { getAllAnnouncementsForAdmin } from "@/actions/announcement"
import { SettingsForm } from "@/components/features/admin/settings-form"
import { PageContainer } from "@/components/ui"
import { Settings2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await getSystemConfig()
  const locations = await getLocations()
  const holidaysResult = await getHolidays()
  const holidays = holidaysResult.success ? holidaysResult.data : []

  const deptsResult = await getDepartments()
  const departments = deptsResult.success ? deptsResult.departments : []

  const announcementsResult = await getAllAnnouncementsForAdmin()
  const announcements = announcementsResult.success ? announcementsResult.data : []

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-4">
      {/* Page Header — matches admin dashboard style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">System Configuration</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage attendance policies, locations, and leave frameworks</p>
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
        initialHolidays={holidays || []}
        initialDepartments={departments || []}
        initialAnnouncements={announcements || []}
      />
    </PageContainer>
  )
}
