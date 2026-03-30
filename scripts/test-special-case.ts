import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { name: { contains: "Priya" } },
    include: { attendances: true }
  });

  if (!user || user.attendances.length === 0) {
    console.log("User or attendances not found");
    return;
  }

  // Find a late mark for Priya and mark it as Special Case
  const lateLog = user.attendances.find(a => a.isLate && !a.isLateSpecialCase);
  if (lateLog) {
    await prisma.attendance.update({
      where: { id: lateLog.id },
      data: { isLateSpecialCase: true }
    });
    console.log(`Updated attendance record for ${user.name} (id: ${lateLog.id}) to Special Case.`);
  } else {
    console.log("No non-special-case late logs found for Priya.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
