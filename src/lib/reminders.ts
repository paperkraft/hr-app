import prisma from "@/lib/prisma";
import { getTodayRange } from "@/lib/attendance-helper";
import { createNotification } from "@/actions/notification";
import { format, parse, addMinutes, isBefore, isAfter, startOfDay } from "date-fns";

export async function processReminders() {
  const { start, end } = getTodayRange();
  
  // Skip if it's a public holiday today
  const holiday = await prisma.publicHoliday.findFirst({
    where: {
      date: { gte: start, lte: end }
    }
  });
  
  if (holiday) {
    console.log(`[REMINDERS] Today is a public holiday (${holiday.name}). Skipping reminders.`);
    return 0;
  }

  console.log("[REMINDERS] Checking for check-in/out reminders...");
  
  const now = new Date();
  const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });
  const users = await prisma.user.findMany({
    include: {
      shift: true,
      location: true,
      attendances: {
        where: {
          date: { gte: start, lte: end }
        }
      },
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { lte: end },
          endDate: { gte: start }
        }
      }
    }
  });

  let reminderCount = 0;

  for (const user of users) {
    // Skip if on leave today
    if (user.leaveRequests.length > 0) continue;
    const startTimeStr = user.shift?.startTime || user.location?.startTime || config?.defaultOfficeStartTime || "09:00";
    const endTimeStr = user.shift?.endTime || user.location?.endTime || config?.defaultOfficeEndTime || "18:00";

    const todayStr = format(now, "yyyy-MM-dd");
    const startTime = parse(`${todayStr} ${startTimeStr}`, "yyyy-MM-dd HH:mm", new Date());
    const endTime = parse(`${todayStr} ${endTimeStr}`, "yyyy-MM-dd HH:mm", new Date());

    const attendance = user.attendances[0];

    // 1. Check-in Reminder (10 minutes before)
    if (!attendance || !attendance.punchIn) {
      const reminderTime = addMinutes(startTime, -5);
      // If now is between 10 mins before and the start time
      if (isAfter(now, reminderTime) && isBefore(now, startTime)) {
        // Check if reminder already sent today
        const alreadySent = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            title: "Check-in Reminder",
            createdAt: { gte: start, lte: end }
          }
        });

        if (!alreadySent) {
          await createNotification({
            userId: user.id,
            title: "Check-in Reminder",
            content: `Good morning! Don't forget to check in. Your shift starts at ${startTimeStr}.`,
            type: "WARNING",
            link: "/dashboard"
          });
          reminderCount++;
        }
      }
    }

    // 2. Check-out Reminder (10 minutes before)
    if (attendance && attendance.punchIn && !attendance.punchOut) {
      const reminderTime = addMinutes(endTime, -5);
      // If now is between 10 mins before and the end time
      if (isAfter(now, reminderTime) && isBefore(now, endTime)) {
        // Check if reminder already sent today
        const alreadySent = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            title: "Check-out Reminder",
            createdAt: { gte: start, lte: end }
          }
        });

        if (!alreadySent) {
          await createNotification({
            userId: user.id,
            title: "Check-out Reminder",
            content: `Your shift ends at ${endTimeStr}. Don't forget to check out!`,
            type: "WARNING",
            link: "/dashboard"
          });
          reminderCount++;
        }
      }
    }
  }

  return reminderCount;
}
