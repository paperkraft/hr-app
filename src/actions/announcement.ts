"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AnnouncementPriority } from "@prisma/client";

export async function getAnnouncements(departmentId?: string) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { targetDepartmentId: null },
          { targetDepartmentId: departmentId },
        ],
      },
      include: {
        author: {
          select: { name: true, email: true }
        },
        targetDepartment: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: announcements };
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return { success: false, error: "Failed to fetch announcements", data: [] };
  }
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targetDepartmentId?: string;
  expiresAt?: Date;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority,
        targetDepartmentId: data.targetDepartmentId || null,
        expiresAt: data.expiresAt,
        authorId: session.user.id,
      },
    });

    // Notify targeted users
    const usersToNotify = await prisma.user.findMany({
      where: data.targetDepartmentId 
        ? { departmentId: data.targetDepartmentId } 
        : {},
      select: { id: true }
    });

    if (usersToNotify.length > 0) {
      const priorityLabel = data.priority === "CRITICAL" ? "Critical " : "";
      await prisma.notification.createMany({
        data: usersToNotify.map(u => ({
          userId: u.id,
          title: `${priorityLabel}New Announcement`,
          content: data.title,
          type: data.priority === "CRITICAL" ? "WARNING" : "INFO",
          link: "/dashboard",
        }))
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin/settings");
    revalidatePath("/dashboard/accountant/settings");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/employee");
    return { success: true, data: announcement };
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return { success: false, error: "Failed to create announcement" };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await prisma.announcement.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin/settings");
    revalidatePath("/dashboard/accountant/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return { success: false, error: "Failed to delete announcement" };
  }
}

export async function toggleAnnouncementActive(id: string, isActive: boolean) {
  try {
    await prisma.announcement.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin/settings");
    revalidatePath("/dashboard/accountant/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle announcement:", error);
    return { success: false, error: "Failed to toggle announcement" };
  }
}

export async function getAllAnnouncementsForAdmin() {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: { select: { name: true, email: true } },
        targetDepartment: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: announcements };
  } catch (error) {
    return { success: false, error: "Failed to fetch all announcements", data: [] };
  }
}
