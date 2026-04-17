"use server";

import { processAllAutoPunchOuts } from "@/lib/auto-punch-out";
import { generateAllMonthlyBalances, syncAllBalances } from "@/lib/balance-accrual";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function triggerMaintenance() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== "ACCOUNTANT" && session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    return { error: "Unauthorized." };
  }

  try {
    const punchOutCount = await processAllAutoPunchOuts();
    const accrualCount = await generateAllMonthlyBalances();
    const syncCount = await syncAllBalances();

    revalidatePath("/dashboard/accountant");
    revalidatePath("/dashboard/admin");
    
    return { 
      success: true, 
      message: `Correction Complete: ${syncCount} balance distributions updated. ${accrualCount} new rows checked. Please refresh your page to see the +0.5 update.`
    };
  } catch (error: any) {
    return { error: "Maintenance failed: " + error.message };
  }
}
