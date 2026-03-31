"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getShifts() {
  try {
    const shifts = await prisma.shift.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    return { success: true, shifts }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch shifts: " + error.message }
  }
}

export async function createShift(data: { name: string, startTime: string, endTime: string }) {
  try {
    await prisma.shift.create({
      data
    })
    revalidatePath("/dashboard/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to create shift: " + error.message }
  }
}

export async function updateShift(id: string, data: { name: string, startTime: string, endTime: string }) {
  try {
    await prisma.shift.update({
      where: { id },
      data
    })
    revalidatePath("/dashboard/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update shift: " + error.message }
  }
}

export async function deleteShift(id: string) {
  try {
    // Check if shift has users
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } }
    })

    if (shift?._count.users && shift._count.users > 0) {
      return { success: false, error: "Cannot delete shift with assigned users. Please reassign users first." }
    }

    await prisma.shift.delete({
      where: { id }
    })
    revalidatePath("/dashboard/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete shift: " + error.message }
  }
}
