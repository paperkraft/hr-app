"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ensureBalance } from "./leave"

async function authorizeAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    throw new Error("Unauthorized. Admin access required.")
  }
}

export async function createUser(data: any) {
  try {
    await authorizeAdmin()
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as Role,
        managerId: data.managerId || null,
        departmentId: data.departmentId || null,
        shiftId: data.shiftId || null,
      }
    })

    // Initialize balance for current month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    await ensureBalance(user.id, currentMonth, currentYear);

    revalidatePath("/dashboard/admin/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to create user: " + error.message }
  }
}

export async function updateUser(id: string, data: any) {
  try {
    await authorizeAdmin()
    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role as Role,
      managerId: data.managerId || null,
      departmentId: data.departmentId || null,
      shiftId: data.shiftId || null,
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    })
    revalidatePath("/dashboard/admin/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update user: " + error.message }
  }
}

export async function deleteUser(id: string) {
  try {
    await authorizeAdmin()
    // Prevent self-deletion
    const session = await getServerSession(authOptions)
    if (session?.user.id === id) {
      return { success: false, error: "You cannot delete your own account." }
    }

    await prisma.user.delete({
      where: { id }
    })
    revalidatePath("/dashboard/admin/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete user: " + error.message }
  }
}
