"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getSystemConfig() {
  const config = await prisma.systemConfig.upsert({
    where: { id: "GLOBAL_CONFIG" },
    update: {},
    create: {
      id: "GLOBAL_CONFIG",
      defaultOfficeStartTime: "09:00",
      defaultOfficeEndTime: "18:00",
      defaultGraceTimeMinutes: 15,
      lateMarkEnabled: true,
      lateMarkAllowedCount: 3,
      specialCaseEnabled: true,
      specialCaseExtraMinutes: 0,
      autoPunchOutEnabled: true,
      autoPunchOutDelayHours: 2,
      autoPunchOutWarningThreshold: 3,
      semiAnnualPolicyEnabled: true,
      semiAnnualCycleStartMonth: 4,
      firstHalfEndTime: "13:30",
      secondHalfStartTime: "13:30",
    },
  })
  
  return config
}

export async function updateSystemConfig(data: {
  defaultOfficeStartTime: string;
  defaultOfficeEndTime: string;
  defaultGraceTimeMinutes: number;
  lateMarkEnabled: boolean;
  lateMarkAllowedCount: number;
  specialCaseEnabled: boolean;
  specialCaseExtraMinutes: number;
  autoPunchOutEnabled: boolean;
  autoPunchOutDelayHours: number;
  autoPunchOutWarningThreshold: number;
  semiAnnualPolicyEnabled: boolean;
  semiAnnualCycleStartMonth: number;
  firstHalfEndTime: string;
  secondHalfStartTime: string;
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    return { error: "Unauthorized access only for administrators." }
  }

  try {
    const updated = await prisma.systemConfig.update({
      where: { id: "GLOBAL_CONFIG" },
      data: {
        defaultOfficeStartTime: data.defaultOfficeStartTime,
        defaultOfficeEndTime: data.defaultOfficeEndTime,
        defaultGraceTimeMinutes: data.defaultGraceTimeMinutes,
        lateMarkEnabled: data.lateMarkEnabled,
        lateMarkAllowedCount: data.lateMarkAllowedCount,
        specialCaseEnabled: data.specialCaseEnabled,
        specialCaseExtraMinutes: data.specialCaseExtraMinutes,
        autoPunchOutEnabled: data.autoPunchOutEnabled,
        autoPunchOutDelayHours: data.autoPunchOutDelayHours,
        autoPunchOutWarningThreshold: data.autoPunchOutWarningThreshold,
        semiAnnualPolicyEnabled: data.semiAnnualPolicyEnabled,
        semiAnnualCycleStartMonth: data.semiAnnualCycleStartMonth,
        firstHalfEndTime: data.firstHalfEndTime,
        secondHalfStartTime: data.secondHalfStartTime,
      },
    })
    
    revalidatePath("/dashboard/admin/settings")
    return { success: true, data: updated }
  } catch (error) {
    console.error("Failed to update system config:", error)
    return { error: "Failed to update configuration." }
  }
}

// New action to manage locations
export async function getLocations() {
  return prisma.location.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function upsertLocation(data: {
  id?: string;
  name: string;
  address?: string;
  startTime: string;
  endTime: string;
  lat?: number;
  lng?: number;
  radiusMeters: number;
  graceTimeMinutes: number;
  isRemote: boolean;
}) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    return { error: "Unauthorized" }
  }

  try {
    if (data.id) {
      const updated = await prisma.location.update({
        where: { id: data.id },
        data: {
          name: data.name,
          address: data.address,
          startTime: data.startTime,
          endTime: data.endTime,
          lat: data.lat,
          lng: data.lng,
          radiusMeters: data.radiusMeters,
          graceTimeMinutes: data.graceTimeMinutes,
          isRemote: data.isRemote,
        }
      })
      revalidatePath("/dashboard/admin/settings")
      return { success: true, data: updated }
    } else {
      const created = await prisma.location.create({
        data: {
          name: data.name,
          address: data.address,
          startTime: data.startTime,
          endTime: data.endTime,
          lat: data.lat,
          lng: data.lng,
          radiusMeters: data.radiusMeters,
          graceTimeMinutes: data.graceTimeMinutes,
          isRemote: data.isRemote,
        }
      })
      revalidatePath("/dashboard/admin/settings")
      return { success: true, data: created }
    }
  } catch (error: any) {
    return { error: error.message || "Failed to save location" }
  }
}
