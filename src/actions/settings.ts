"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getSystemConfig() {
  console.log("PRISMA MODELS AVAILABLE:", Object.keys(prisma))
  // Ensure only authorized users (e.g., ADMIN) can access this if needed, 
  // but usually settings are checked by system components too.
  
  const config = await prisma.systemConfig.upsert({
    where: { id: "GLOBAL_CONFIG" },
    update: {},
    create: {
      id: "GLOBAL_CONFIG",
      officeStartTime: "09:00",
      officeEndTime: "18:00",
      graceTimeMinutes: 15,
    },
  })
  
  return config
}

export async function updateSystemConfig(data: {
  officeStartTime: string;
  officeEndTime: string;
  graceTimeMinutes: number;
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
