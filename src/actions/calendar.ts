"use server";

import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, isWeekend, isToday, startOfDay, endOfDay } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayRange } from "@/lib/attendance-helper";

export async function getCalendarEvents(month?: number, year?: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    const start = startOfMonth(new Date(targetYear, targetMonth));
    const end = endOfMonth(new Date(targetYear, targetMonth));

    // For holidays, we fetch for the entire year to support frontend navigation without refetching
    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59);

    const currentUserRole = session.user.role;
    const currentUserId = session.user.id;

    console.log(`[Calendar] Fetching for User: ${currentUserId}, Role: ${currentUserRole}`);

    // Fetch Public Holidays (Global for the current target year)
    const holidays = await prisma.publicHoliday.findMany({
      where: {
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
    });

    // Fetch Birthdays
    const employees = await prisma.user.findMany({
      where: {
        dateOfBirth: { not: null }
      },
      select: {
        id: true,
        name: true,
        dateOfBirth: true
      }
    });

    const birthdays = employees.map(emp => {
      const dob = new Date(emp.dateOfBirth!);
      // Adjust year to the target year so it appears on the calendar
      const eventDate = new Date(targetYear, dob.getMonth(), dob.getDate());
      return {
        id: `bday-${emp.id}`,
        title: `${emp.name}'s Birthday`,
        date: eventDate,
        type: "BIRTHDAY"
      };
    });

    console.log(`[Calendar] Found ${birthdays.length} birthdays`);

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
        birthdays,
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
