import prisma from "@/lib/prisma"
import { Building2 } from "lucide-react"
import { DepartmentList } from "@/components/features/admin/department-list"
import { AddDepartmentDialog } from "@/components/features/admin/add-department-dialog"
import { PageContainer } from "@/components/ui"

export const dynamic = 'force-dynamic'

export default async function AdminDepartmentsPage() {
  const departments = await prisma.department.findMany({
    include: {
      teamLeader: {
        select: { id: true, name: true, email: true }
      },
      _count: { select: { members: true } }
    },
    orderBy: { name: 'asc' }
  })

  const users = await prisma.user.findMany({
    where: { role: { not: 'SYSTEM_ADMIN' } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  })

  return (
    <PageContainer maxWidth="full" className="py-8 animate-fade-in space-y-6">
      {/* Page Header — consistent with admin dashboard */}
      <div className="flex items-center justify-between">
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
