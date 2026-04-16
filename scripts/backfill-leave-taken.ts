import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const { Pool } = pg;
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function getDaysDifference(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
}

function splitLeaveIntoMonths(start: Date, end: Date) {
  const parts: { month: number; year: number; days: number }[] = [];
  let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const final = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= final) {
    const m = current.getMonth();
    const y = current.getFullYear();
    const monthStart = new Date(y, m, 1);
    const nextMonthStart = new Date(y, m + 1, 1);
    
    const partStart = current > monthStart ? current : monthStart;
    const partEnd = final < nextMonthStart ? final : new Date(y, m + 1, 0);

    parts.push({
      month: m + 1,
      year: y,
      days: getDaysDifference(partStart, partEnd),
    });

    current = nextMonthStart;
  }
  return parts;
}

async function main() {
  console.log("Starting backfill for LeaveBalance counters...");

  // Reset all counters first
  await prisma.leaveBalance.updateMany({
    data: {
      fullTaken: 0.0,
      shortTaken: 0,
      semiAnnualTaken: 0.0,
      unpaidTaken: 0.0
    }
  });

  const approvedRequests = await prisma.leaveRequest.findMany({
    where: { status: "APPROVED" }
  });

  console.log(`Found ${approvedRequests.length} approved requests.`);

  for (const req of approvedRequests) {
    const monthParts = splitLeaveIntoMonths(req.startDate, req.endDate);

    for (const part of monthParts) {
      const balanceKey = { userId: req.userId, month: part.month, year: part.year };
      
      let balance = await prisma.leaveBalance.findUnique({
        where: { userId_month_year: balanceKey }
      });

      if (!balance) {
        try {
          console.log(`Creating record for ${req.userId} on ${part.month}/${part.year}`);
          balance = await prisma.leaveBalance.create({
            data: {
              ...balanceKey,
              remainingFull: 2.0,
              remainingShort: 1,
              semiAnnualRemaining: 3
            }
          });
        } catch (e) {
          balance = await prisma.leaveBalance.findUniqueOrThrow({
            where: { userId_month_year: balanceKey }
          });
        }
      }

      let field: "fullTaken" | "shortTaken" | "semiAnnualTaken" | "unpaidTaken" | null = null;
      let amount = 0;

      if (req.category === "MONTHLY_POLICY_1") {
        if (req.duration === "SHORT") {
          field = "shortTaken";
          amount = 1;
        } else {
          field = "fullTaken";
          amount = req.duration === "HALF" ? 0.5 * part.days : part.days;
        }
      } else if (req.category === "SEMI_ANNUAL_POLICY_2") {
        field = "semiAnnualTaken";
        amount = part.days;
      } else if (req.category === "UNPAID") {
        field = "unpaidTaken";
        amount = req.duration === "HALF" ? 0.5 * part.days : part.days;
      }

      if (field) {
        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: { [field]: { increment: amount } }
        });
        console.log(`User ${req.userId}: ${part.month}/${part.year} -> ${field} +${amount}`);
      }
    }
  }

  console.log("Backfill completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
