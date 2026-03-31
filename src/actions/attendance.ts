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

    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(',')[0] : "127.0.0.1";

    const { start, end } = getTodayRange()

    // FETCH GLOBAL CONFIG FOR LATE CALCULATION & GEOFENCING
    const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } })
    const startTime = config?.officeStartTime || "09:00"
    const graceMinutes = config?.graceTimeMinutes ?? 15
    const officeLat = config?.officeLat;
    const officeLng = config?.officeLng;
    const allowedRadius = config?.allowedRadiusMeters ?? 500;

    let isOutsideOffice = false;
    if (coords && officeLat != null && officeLng != null) {
      const distance = getDistanceInMeters(coords.lat, coords.lng, officeLat, officeLng);
      if (distance > allowedRadius) {
        isOutsideOffice = true;
      }
    }

    const existingLog = await prisma.attendance.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: start,
          lte: end,
        }
      }
    })

    if (!existingLog) {
      const punchInTime = new Date()
      // Determine if late based on config (THESE VALUES ARE NOW DYNAMIC FROM CONFIG)
      const lateThreshold = new Date(start)
      const [hours, minutes] = startTime.split(":").map(Number)
      lateThreshold.setHours(hours, minutes + graceMinutes, 0, 0)
      
      const isLate = punchInTime > lateThreshold;

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
      
      // LOGIC: If user was late, check if they covered their shift duration
      let isSpecialCase = false;
      if (existingLog.isLate) {
        const endTime = config?.officeEndTime || "18:00";
        
        // Calculate standard duration in minutes
        const [sH, sM] = startTime.split(":").map(Number);
        const [eH, eM] = endTime.split(":").map(Number);
        const standardMinutes = (eH * 60 + eM) - (sH * 60 + sM);
        
        // Calculate actual duration in minutes
        const actualMinutes = Math.floor((punchOutTime.getTime() - existingLog.punchIn.getTime()) / (1000 * 60));
        
        if (actualMinutes >= standardMinutes) {
          isSpecialCase = true;
        }
      }

      await prisma.attendance.update({
        where: { id: existingLog.id },
        data: {
          punchOut: punchOutTime,
          isLateSpecialCase: isSpecialCase,
          // Update location on punch-out too if available
          lat: coords?.lat ?? existingLog.lat,
          lng: coords?.lng ?? existingLog.lng,
          ipAddress: ipAddress ?? existingLog.ipAddress,
          isOutsideOffice: isOutsideOffice || existingLog.isOutsideOffice // Flag if either was outside
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