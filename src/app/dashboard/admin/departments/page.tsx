import prisma from "@/lib/prisma"
import { Building2 } from "lucide-react"
import { DepartmentList } from "@/components/features/admin/department-list"
import { AddDepartmentDialog } from "@/components/features/admin/add-department-dialog"

export const dynamic = 'force-dynamic'

export default async function AdminDepartmentsPage() {
  const departments = await prisma.department.findMany({
    include: {
      teamLeader: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      _count: {
        select: { members: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  const users = await prisma.user.findMany({
    where: {
      role: { not: 'SYSTEM_ADMIN' }
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Management</h1>
          <p className="text-muted-foreground mt-1">Manage organizational units and assign team leaders.</p>
        </div>
        <AddDepartmentDialog />
      </div>

      <div className="grid gap-6">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Department Roles</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Each department can have one designated Team Leader. This person acts as the primary 
              contact and manager for the employees within that department. You can assign any existing 
              user as a leader using the dropdowns below.
            </p>
          </div>
        </div>

        <DepartmentList departments={departments} users={users} />
      </div>
    </div>
  )
}
