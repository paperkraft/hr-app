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

    // Build the visibility filter for leaves
    let leaveWhereClause: any = {
      status: { in: ["APPROVED", "PENDING"] },
      startDate: { lte: end },
      endDate: { gte: start },
    };

    // Apply role-based filtering
    if (currentUserRole !== "ADMIN" && currentUserRole !== "SYSTEM_ADMIN" && currentUserRole !== "ACCOUNTANT") {
      leaveWhereClause.OR = [
        { userId: currentUserId }, // Always see self
        { user: { managerId: currentUserId } }, // See direct reports
        { user: { department: { teamLeaderId: currentUserId } } } // See department members if Team Leader
      ];
    }

    console.log(`[Calendar] Query:`, JSON.stringify(leaveWhereClause, null, 2));

    // Fetch Leaves based on permissions
    const leaves = await prisma.leaveRequest.findMany({
      where: leaveWhereClause,
      include: {
        user: {
          select: { name: true, role: true }
        }
      }
    });

    console.log(`[Calendar] Found ${leaves.length} leaves`);

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
          title: l.userId === currentUserId ? "Me on Leave" : `${l.user.name} on Leave`,
          startDate: l.startDate,
          endDate: l.endDate,
          category: l.category,
          status: l.status,
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
