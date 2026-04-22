"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { getTodayRange } from "@/lib/attendance-helper"
import { headers } from "next/headers"
import { getDistanceInMeters } from "@/lib/geofencing"
import { createNotification } from "./notification"

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
    const GEOFENCE_TOLERANCE = 5; // 5 meters buffer for GPS jitter

    if (user.workMode === "OFFICE" || user.workMode === "HYBRID") {
      // Check against their assigned location
      if (user.location && !user.location.isRemote && user.location.lat != null && user.location.lng != null) {
        if (coords) {
          const distance = getDistanceInMeters(coords.lat, coords.lng, user.location.lat, user.location.lng);
          
          // Enhanced logging for debugging
          console.log(`[GEOFENCE] Verification - User: ${user.name}, Mode: ${user.workMode}, Dist: ${distance.toFixed(2)}m, Radius: ${user.location.radiusMeters}m (Threshold: ${user.location.radiusMeters + GEOFENCE_TOLERANCE}m)`);

          if (distance > (user.location.radiusMeters + GEOFENCE_TOLERANCE)) {
            isOutsideOffice = true;
          }
        } else {
          // For strictly OFFICE workers, missing coordinates is an automatic outside-office flag
          if (user.workMode === "OFFICE") {
            isOutsideOffice = true;
          }
        }
      }
    } else if (user.workMode === "REMOTE") {
      // Remote employees are never "outside office" in the penalty sense
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
          punchInLat: coords?.lat,
          punchInLng: coords?.lng,
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
          punchOutLat: coords?.lat,
          punchOutLng: coords?.lng,
          ipAddress: ipAddress ?? (existingLog as any).ipAddress,
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

export async function revertPunchOutAction(attendanceId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    // Role check: Only Accountant, Admin, or System Admin can revert
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!currentUser || !["ACCOUNTANT", "ADMIN", "SYSTEM_ADMIN"].includes(currentUser.role)) {
      return { success: false, error: "Insufficient permissions to revert check-out" };
    }

    const log = await prisma.attendance.findUnique({
      where: { id: attendanceId }
    });

    if (!log) return { success: false, error: "Attendance log not found" };

    // Date check: Only today's check-outs can be reverted
    const { start, end } = getTodayRange();
    const logDate = new Date(log.date);
    if (logDate < start || logDate > end) {
      return { success: false, error: "You can only revert check-outs for today's logs. Past records cannot be modified." };
    }

    if (!log.punchOut) return { success: false, error: "User is already punched in" };

    await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        punchOut: null,
        punchOutLat: null,
        punchOutLng: null,
        isLateSpecialCase: false, // Reset special case if checkout is reverted
        isAutoPunchOut: false     // Also reset auto-checkout flag if present
      }
    });

    // 4. Create Notification for the User
    try {
      await createNotification({
        userId: log.userId,
        title: "Check-out Reverted",
        content: `Your check-out for today has been reverted by ${session.user.name || "Administration"}. Your session is now active again.`,
        type: "WARNING"
      });
    } catch (notifError) {
      console.error("Failed to notify user about revert:", notifError);
    }

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Revert Error:", error);
    return { success: false, error: "Failed to revert check-out: " + error.message };
  }
}