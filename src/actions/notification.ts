"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { getTodayRange } from "@/lib/attendance-helper";

export async function getNotifications(limit?: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: limit } : {}),
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        location: true,
        shift: true 
      }
    });

    const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL_CONFIG" } });
    const startTime = user?.shift?.startTime || user?.location?.startTime || config?.defaultOfficeStartTime || "09:00";
    const endTime = user?.shift?.endTime || user?.location?.endTime || config?.defaultOfficeEndTime || "18:00";

    const { start, end } = getTodayRange();
    const todaysLog = await prisma.attendance.findFirst({
      where: { userId: session.user.id, date: { gte: start, lte: end } }
    });

    return { 
      success: true, 
      data: notifications as any[],
      attendance: {
        startTime,
        endTime,
        hasPunchedIn: !!todaysLog,
        hasPunchedOut: !!todaysLog?.punchOut
      }
    };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { success: false, error: "Failed to fetch notifications", data: [] };
  }
}

export async function createNotification(data: {
  userId: string;
  title: string;
  content: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  link?: string;
}) {
  try {
    let targetUserId = data.userId;

    if (!targetUserId || targetUserId === "current") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return { success: false, error: "Unauthorized" };
      targetUserId = session.user.id;
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: data.title,
        content: data.content,
        type: data.type || "INFO",
        link: data.link,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, data: notification };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

export async function markAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error: "Failed to mark as read" };
  }
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false, error: "Failed to mark all as read" };
  }
}

export async function deleteNotification(id: string) {
  try {
    await prisma.notification.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function clearAllNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.notification.deleteMany({
      where: { userId: session.user.id },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to clear notifications:", error);
    return { success: false, error: "Failed to clear notifications" };
  }
}
