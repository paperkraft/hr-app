"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

export async function createUser(data: any) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as Role,
        managerId: data.managerId || null,
        leaveBalances: {
          create: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          }
        }
      }
    })
    revalidatePath("/dashboard/admin/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to create user: " + error.message }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    })
    revalidatePath("/dashboard/admin/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete user: " + error.message }
  }
}
