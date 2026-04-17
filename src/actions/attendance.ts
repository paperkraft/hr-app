"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { getTodayRange } from "@/lib/attendance-helper"
import { headers } from "next/headers"
import { getDistanceInMeters } from "@/lib/geofencing"

export async function punchInOutAction(coords?: { lat: number; lng: number }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        location: true,
        shift: true 
      }
    })

    if (!user) return { success: false, error: "User not found" }

    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(',')[0] : "127.0.0.1";

    const { start, end } = getTodayRange()

    // 1. Determine Office Timings & Policy
    const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } })
    
    // Priority for timings: Shift > Location > System Default
    const startTime = user.shift?.startTime || user.location?.startTime || config?.defaultOfficeStartTime || "09:00"
    const endTime = user.shift?.endTime || user.location?.endTime || config?.defaultOfficeEndTime || "18:00"
    const graceMinutes = user.location?.graceTimeMinutes ?? config?.defaultGraceTimeMinutes ?? 15

    // 2. Geofencing Logic based on Work Mode
    let isOutsideOffice = false;
    
    if (user.workMode === "OFFICE") {
      // For strictly on-site mode, check against their assigned location
      if (user.location && !user.location.isRemote && user.location.lat != null && user.location.lng != null) {
        if (coords) {
          const distance = getDistanceInMeters(coords.lat, coords.lng, user.location.lat, user.location.lng);
          if (distance > user.location.radiusMeters) {
            isOutsideOffice = true;
          }
        } else {
          // If in OFFICE mode but no coords provided, mark as outside
          isOutsideOffice = true;
        }
      }
    } else if (user.workMode === "REMOTE" || user.workMode === "HYBRID") {
      // Remote & Hybrid employees are never "outside office" in the penalty sense
      isOutsideOffice = false;
    }

    const existingLog = await prisma.attendance.findFirst({
      where: {
        userId: session.user.id,
        date: { gte: start, lte: end }
      }
    })

    if (!existingLog) {
      const punchInTime = new Date()
      const [hours, minutes] = startTime.split(":").map(Number)
      
      const lateThreshold = new Date(start)
      lateThreshold.setHours(hours, minutes + graceMinutes, 0, 0)
      
      const lateMarkEnabled = config?.lateMarkEnabled ?? true;
      const isLate = lateMarkEnabled ? (punchInTime > lateThreshold) : false;

      await prisma.attendance.create({
        data: {
          userId: session.user.id,
          date: start, 
          punchIn: punchInTime,
          isLate,
          lat: coords?.lat,
          lng: coords?.lng,
          ipAddress,
          isOutsideOffice
        }
      })
    } else if (!existingLog.punchOut) {
      const punchOutTime = new Date();
      
      let isSpecialCase = false;
      const specialCaseEnabled = config?.specialCaseEnabled ?? true;
      const extraMinutes = config?.specialCaseExtraMinutes ?? 0;

      if (specialCaseEnabled && existingLog.isLate) {
        const [sH, sM] = startTime.split(":").map(Number);
        const [eH, eM] = endTime.split(":").map(Number);
        const standardMinutes = (eH * 60 + eM) - (sH * 60 + sM);
        
        const actualMinutes = Math.floor((punchOutTime.getTime() - existingLog.punchIn.getTime()) / (1000 * 60));
        
        if (actualMinutes >= (standardMinutes + extraMinutes)) {
          isSpecialCase = true;
        }
      }

      await prisma.attendance.update({
        where: { id: existingLog.id },
        data: {
          punchOut: punchOutTime,
          isLateSpecialCase: isSpecialCase,
          lat: coords?.lat ?? existingLog.lat,
          lng: coords?.lng ?? existingLog.lng,
          ipAddress: ipAddress ?? existingLog.ipAddress,
          isOutsideOffice: isOutsideOffice || existingLog.isOutsideOffice 
        }
      })
    }

    revalidatePath("/dashboard", "layout")
    return { success: true }
  } catch (error: any) {
    console.error("Punch Error:", error);
    return { success: false, error: "Failed to process punch: " + error.message }
  }
}