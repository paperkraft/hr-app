"use server";

import { processAllAutoPunchOuts } from "@/lib/auto-punch-out";
import { generateAllMonthlyBalances, syncAllBalances } from "@/lib/balance-accrual";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function triggerMaintenance() {
  const session = await getServerSession(authOptions);
  
  // Security: Only Accountant or Admins can trigger manual maintenance
  if (!session?.user || (session.user.role !== "ACCOUNTANT" && session.user.role !== "ADMIN" && session.user.role !== "SYSTEM_ADMIN")) {
    return { error: "Unauthorized. Required Accountant or Admin role." };
  }

  try {
    console.log("[MAINTENANCE] Manual trigger started by", session.user.email);

    // 1. Process Auto Punch-Outs
    const punchOutCount = await processAllAutoPunchOuts();
    
    // 2. Generate Monthly Balances
    const accrualCount = await generateAllMonthlyBalances();

    // 3. Sync Existing Balances (Corrects any historical rounding issues)
    const syncCount = await syncAllBalances();

    revalidatePath("/dashboard/accountant");
    revalidatePath("/dashboard/admin");
    
    return { 
      success: true, 
      message: `Maintenance Complete: ${punchOutCount} punch-outs processed, ${accrualCount} balances created, and ${syncCount} accounts synchronized.`
    };
  } catch (error: any) {
    console.error("[MAINTENANCE] Manual trigger failed:", error);
    return { error: "Maintenance failed: " + error.message };
  }
}
