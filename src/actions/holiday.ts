"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getHolidays() {
  try {
    const holidays = await prisma.publicHoliday.findMany({
      orderBy: { date: "asc" },
    });
    return { success: true, data: holidays };
  } catch (error) {
    console.error("Failed to fetch holidays:", error);
    return { success: false, error: "Failed to fetch holidays" };
  }
}

export async function addHoliday(name: string, date: Date) {
  try {
    const holiday = await prisma.publicHoliday.create({
      data: {
        name,
        date,
      },
    });
    revalidatePath("/dashboard/admin/settings");
    revalidatePath("/dashboard/accountant/settings");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/employee");
    return { success: true, data: holiday };
  } catch (error) {
    console.error("Failed to add holiday:", error);
    return { success: false, error: "Failed to add holiday" };
  }
}

export async function deleteHoliday(id: string) {
  try {
    await prisma.publicHoliday.delete({
      where: { id },
    });
    revalidatePath("/dashboard/admin/settings");
    revalidatePath("/dashboard/accountant/settings");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/employee");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete holiday:", error);
    return { success: false, error: "Failed to delete holiday" };
  }
}

export async function getUpcomingHolidays(limit: number = 5) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  try {
    const holidays = await prisma.publicHoliday.findMany({
      where: {
        date: {
          gte: now,
        },
      },
      orderBy: { date: "asc" },
      take: limit,
    });
    return { success: true, data: holidays };
  } catch (error) {
    console.error("Failed to fetch upcoming holidays:", error);
    return { success: false, error: "Failed to fetch upcoming holidays" };
  }
}
