"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function authorizeAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    throw new Error("Unauthorized. Admin access required.")
  }
}

export async function getDepartments() {
  try {
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
    return { success: true, departments }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch departments: " + error.message }
  }
}

export async function updateDepartmentLeader(departmentId: string, leaderId: string | null) {
  try {
    await authorizeAdmin()
    await prisma.department.update({
      where: { id: departmentId },
      data: {
        teamLeaderId: leaderId || null
      }
    })
    revalidatePath("/dashboard/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update department leader: " + error.message }
  }
}

export async function createDepartment(name: string) {
  try {
    await authorizeAdmin()
    await prisma.department.create({
      data: { name }
    })
    revalidatePath("/dashboard/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to create department: " + error.message }
  }
}

export async function deleteDepartment(id: string) {
  try {
    await authorizeAdmin()
    await prisma.department.delete({
      where: { id }
    })
    revalidatePath("/dashboard/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete department: " + error.message }
  }
}
