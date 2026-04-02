import { NextRequest, NextResponse } from "next/server";
import { processAllAutoPunchOuts } from "@/lib/auto-punch-out";
import { generateAllMonthlyBalances } from "@/lib/balance-accrual";

/**
 * SECURE CRON ENDPOINT
 * Triggers daily/monthly maintenance tasks for HRM.
 * 
 * Authorization: 
 * 1. Bearer Token in header: `Authorization: Bearer <CRON_SECRET>`
 * 2. Query Parameter: `?key=<CRON_SECRET>`
 * 
 * Note: If CRON_SECRET is not set in environment variables, the route is unprotected
 * (only for local development convenience).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("key") || request.headers.get("Authorization")?.replace("Bearer ", "");

  const serverSecret = process.env.CRON_SECRET;

  // Basic security check
  if (serverSecret && secret !== serverSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[CRON] Starting maintenance tasks...");

    // 1. Proactive Auto Punch-Out
    const punchOutCount = await processAllAutoPunchOuts();
    console.log(`[CRON] Processed ${punchOutCount} auto punch-outs.`);

    // 2. Proactive Leave Accrual (Monthly initialization)
    const accrualCount = await generateAllMonthlyBalances();
    console.log(`[CRON] Processed ${accrualCount} user leave balances.`);

    return NextResponse.json({
      success: true,
      processed: {
        autoPunchOuts: punchOutCount,
        monthlyBalancesCount: accrualCount,
      },
      time: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[CRON] Maintenance failed:", error);
    return NextResponse.json({ 
      error: "Maintenance task failed", 
      details: error.message 
    }, { status: 500 });
  }
}
