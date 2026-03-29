"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { getTodayRange } from "@/lib/attendance-helper"

export async function punchInOutAction() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const { start, end } = getTodayRange()

    // STRICT BOUNDARIES APPLIED HERE
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
      // Determine if late (e.g. after 9:15 AM)
      const lateThreshold = new Date(start)
      lateThreshold.setHours(9, 15, 0, 0)
      const isLate = punchInTime > lateThreshold;

      await prisma.attendance.create({
        data: {
          userId: session.user.id,
          date: start, // Mark the log for the start of "today"
          punchIn: punchInTime,
          isLate,
        }
      })
    } else if (!existingLog.punchOut) {
      await prisma.attendance.update({
        where: { id: existingLog.id },
        data: {
          punchOut: new Date()
        }
      })
    }

    revalidatePath("/dashboard", "layout")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to process punch: " + error.message }
  }
}