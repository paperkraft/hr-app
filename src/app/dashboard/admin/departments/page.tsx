import { Building2 } from "lucide-react"
import { DepartmentList } from "@/components/features/admin/department-list"
import { AddDepartmentDialog } from "@/components/features/admin/add-department-dialog"
import { PageContainer } from "@/components/ui"
import { getAdminDepartmentsData } from "@/actions/department"

export const dynamic = 'force-dynamic'

export default async function AdminDepartmentsPage() {
  const result = await getAdminDepartmentsData()
  if (!result.success || !result.data) return <div>Error loading departments</div>
  const { departments, users } = result.data

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">
      {/* Page Header — consistent with admin dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Departments</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage functional units and team leadership assignments</p>
        </div>
        <AddDepartmentDialog />
      </div>

      <DepartmentList departments={departments} users={users} />
    </PageContainer>
  )
}
