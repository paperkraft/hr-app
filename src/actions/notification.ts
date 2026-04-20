"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return { success: true, data: notifications };
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
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
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
