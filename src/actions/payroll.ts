"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function applyForAllowance(data: {
  fromDate: string;
  toDate: string;
  location: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const fromDate = new Date(data.fromDate);
    const toDate = new Date(data.toDate);

    if (toDate < fromDate) {
      return { error: "End date cannot be before start date" };
    }

    await prisma.allowance.create({
      data: {
        userId: session.user.id,
        fromDate,
        toDate,
        location: data.location,
        status: "PENDING",
      },
    });

    revalidatePath("/dashboard/employee");
    revalidatePath("/dashboard/accountant");
    return { success: true };
  } catch (error) {
    console.error("Failed to apply for allowance:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function createAllowance(data: {
  userId: string;
  fromDate: string;
  toDate: string;
  location: string;
  status?: "APPROVED" | "PENDING" | "REJECTED";
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ACCOUNTANT") {
    return { error: "Unauthorized" };
  }

  try {
    const fromDate = new Date(data.fromDate);
    const toDate = new Date(data.toDate);

    await prisma.allowance.create({
      data: {
        userId: data.userId,
        fromDate,
        toDate,
        location: data.location,
        status: data.status || "APPROVED",
      },
    });

    revalidatePath("/dashboard/accountant");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}
