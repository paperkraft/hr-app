"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { Role, WorkMode } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ensureBalance } from "./leave"

async function authorizeUserManagement() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN" && session.user.role !== "ACCOUNTANT")) {
    throw new Error("Unauthorized. Required appropriate permissions.")
  }
}

export async function createUser(data: any) {
  try {
    await authorizeUserManagement()
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
        locationId: data.locationId || null,
        workMode: (data.workMode as WorkMode) || "OFFICE",
        dateOfBirth: data.dateOfBirth || null,
        joiningDate: data.joiningDate || null,
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
    await authorizeUserManagement()
    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role as Role,
      managerId: data.managerId || null,
      departmentId: data.departmentId || null,
      shiftId: data.shiftId || null,
      locationId: data.locationId || null,
      workMode: (data.workMode as WorkMode) || "OFFICE",
      dateOfBirth: data.dateOfBirth || null,
      joiningDate: data.joiningDate || null,
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
    await authorizeUserManagement()
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

export async function getAdminUsersData() {
  try {
    await authorizeUserManagement()
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'SYSTEM_ADMIN' }
      },
      include: {
        manager: true,
        department: true,
        shift: true,
        location: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const validManagers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'EMPLOYEE', 'ACCOUNTANT'] }
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    });

    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });

    const locations = await prisma.location.findMany({
      select: { id: true, name: true, isRemote: true },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: {
        users,
        validManagers,
        departments,
        locations
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
