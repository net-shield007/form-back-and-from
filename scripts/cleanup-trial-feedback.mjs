import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Previewing trial feedback records...");

  const whereClause = {
    OR: [
      { email: "ishaanbusi@gmail.com" },
      { email: "ishaanbusiness@gmail.com" },
      { email: "ishaanbusi+business@gmail.com" },
      { email: "ishaan.shrivastava@tritorc.com" },
      { email: "omkar@tritorc.com" },
      { email: { endsWith: "@tritorc.com" } },
    ],
  };

  const preview = await prisma.feedback.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      companyName: true,
      createdAt: true,
      deletedAt: true,
    },
  });

  console.table(preview);

  if (preview.length === 0) {
    console.log("✅ No additional trial records found.");
    return;
  }

  const result = await prisma.feedback.updateMany({
    where: whereClause,
    data: { deletedAt: new Date() },
  });

  console.log(`✅ Soft-deleted ${result.count} additional trial records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
