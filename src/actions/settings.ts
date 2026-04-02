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
      officeStartTime: "09:00",
      officeEndTime: "18:00",
      graceTimeMinutes: 15,
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
  officeStartTime: string;
  officeEndTime: string;
  graceTimeMinutes: number;
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
  officeLat?: number;
  officeLng?: number;
  allowedRadiusMeters?: number;
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    return { error: "Unauthorized access only for administrators." }
  }

  try {
    const updated = await prisma.systemConfig.update({
      where: { id: "GLOBAL_CONFIG" },
      data: {
        officeStartTime: data.officeStartTime,
        officeEndTime: data.officeEndTime,
        graceTimeMinutes: data.graceTimeMinutes,
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
        officeLat: data.officeLat,
        officeLng: data.officeLng,
        allowedRadiusMeters: data.allowedRadiusMeters,
      },
    })
    
    revalidatePath("/dashboard/admin/settings")
    return { success: true, data: updated }
  } catch (error) {
    console.error("Failed to update system config:", error)
    return { error: "Failed to update configuration." }
  }
}
