"use server";

import { revalidatePath } from "next/cache";
import { splitBalanceSchema } from "@/lib/validations/accountant";
import prisma from "@/lib/prisma";

export async function processLeaveSplit(formData: unknown) {
  const parsed = splitBalanceSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { userId, month, year, carriedForward, encashed } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch and update the TARGET month's record (e.g., April)
      const currentRecord = await tx.leaveBalance.findUnique({
        where: { userId_month_year: { userId, month, year } }
      });

      if (!currentRecord) throw new Error("Current month balance record not found.");

      await tx.leaveBalance.update({
        where: { id: currentRecord.id },
        data: {
          carriedForward: carriedForward,
          encashed: encashed,
        }
      });

      // 2. Identify the SUBSEQUENT month (e.g., May)
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;

      const nextRecord = await tx.leaveBalance.findUnique({
        where: { userId_month_year: { userId, month: nextMonth, year: nextYear } }
      });

      if (nextRecord) {
        const oldCF = currentRecord.carriedForward;
        const diff = carriedForward - oldCF;

        if (diff !== 0) {
          await tx.leaveBalance.update({
            where: { id: nextRecord.id },
            data: {
              carriedForward: carriedForward,
              remainingFull: { increment: diff }
            }
          });
        }
      }

      return { success: true };
    });

    revalidatePath("/dashboard/accountant");
    revalidatePath("/dashboard/employee");
    return result;
  } catch (error: any) {
    console.error("Split processing error:", error);
    return { error: "Failed to process the leave balance split: " + error.message };
  }
}