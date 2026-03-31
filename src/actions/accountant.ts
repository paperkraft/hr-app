"use server";

import { revalidatePath } from "next/cache";
import { splitBalanceSchema } from "@/lib/validations/accountant";
import prisma from "@/lib/prisma";

export async function processLeaveSplit(formData: unknown) {
  const parsed = splitBalanceSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { userId, carriedForward, encashed } = parsed.data;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  try {
    // Wrap in a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Fetch the previous month's balance to mark it as processed (optional, based on your exact schema)
      // 2. Update the CURRENT month's newly generated balance with the finalized split
      await tx.leaveBalance.update({
        where: {
          userId_month_year: { userId, month: currentMonth, year: currentYear }
        },
        data: {
          carriedForward: carriedForward,
          encashed: encashed,
          // Reset the remaining full to the standard 2.0 + whatever was carried forward
          remainingFull: 2.0 + carriedForward, 
        }
      });
    });

    revalidatePath("/dashboard/accountant");
    return { success: true };
  } catch (error) {
    console.error("Split processing error:", error);
    return { error: "Failed to process the leave balance split." };
  }
}