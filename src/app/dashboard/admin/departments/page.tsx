import prisma from "@/lib/prisma"
import { Building2, Info } from "lucide-react"
import { DepartmentList } from "@/components/features/admin/department-list"
import { AddDepartmentDialog } from "@/components/features/admin/add-department-dialog"
import { PageContainer, PageHeader } from "@/components/ui"

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
    <PageContainer maxWidth="full" className="py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <PageHeader
          title="Organizational Clusters"
          description="Architecture and leadership management for functional departments."
        />
        <AddDepartmentDialog />
      </div>

      <div className="grid gap-8">
        <div className="premium-card shadow-xl border-border/40 bg-primary/2 overflow-hidden">
          <div className="p-6 flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Info className="size-6 shadow-sm" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black uppercase tracking-widest text-foreground">Leadership Hierarchy</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-3xl leading-relaxed font-medium">
                Functional units are governed by designated Team Leaders. These individuals act as primary
                administrative anchors for their respective clusters. Use the management grid below to
                designate leadership roles and verify membership saturation.
              </p>
            </div>
          </div>
        </div>

        <DepartmentList departments={departments} users={users} />
      </div>
    </PageContainer>
  )
}
