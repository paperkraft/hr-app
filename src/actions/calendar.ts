"use server";

import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getCalendarEvents(month?: number, year?: number) {
  try {
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    const start = startOfMonth(new Date(targetYear, targetMonth));
    const end = endOfMonth(new Date(targetYear, targetMonth));

    // Fetch Public Holidays
    const holidays = await prisma.publicHoliday.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // Fetch Approved Leaves
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        status: "APPROVED",
        startDate: {
          lte: end,
        },
        endDate: {
          gte: start,
        },
      },
      include: {
        user: {
          select: { name: true, role: true }
        }
      }
    });

    // Fetch Announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    return {
      success: true,
      data: {
        holidays: holidays.map(h => ({
          id: h.id,
          title: h.name,
          date: h.date,
          type: "HOLIDAY"
        })),
        leaves: leaves.map(l => ({
          id: l.id,
          title: `${l.user.name} on Leave`,
          startDate: l.startDate,
          endDate: l.endDate,
          category: l.category,
          type: "LEAVE"
        })),
        announcements: announcements.map(a => ({
          id: a.id,
          title: a.title,
          date: a.createdAt,
          type: "ANNOUNCEMENT"
        }))
      }
    };
  } catch (error) {
    console.error("Failed to fetch calendar events:", error);
    return { success: false, error: "Failed to load calendar" };
  }
}
