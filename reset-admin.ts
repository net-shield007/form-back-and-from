import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Resetting admin password...");

  const hashed = await bcrypt.hash("Tritorc@2025", 12);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@tritorc.com" },
    update: { password: hashed },
    create: {
      email: "admin@tritorc.com",
      password: hashed,
      name: "Tritorc Admin"
    }
  });

  console.log("✅ Password reset successfully!");
  console.log("📧 Email:", admin.email);
  console.log("🔑 New Password: Tritorc@2025");

  console.log("Done.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
