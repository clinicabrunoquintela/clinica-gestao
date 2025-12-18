const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // Create admin user if it does not exist
  await prisma.user.upsert({
    where: { email: "darkbdf@gmail.com" },
    update: {
      passwordHash: password,
      role: "ADMIN",
    },
    create: {
      name: "Administrador",
      email: "darkbdf@gmail.com",
      passwordHash: password,
      role: "ADMIN",
    },
  });

  console.log("✔ Admin seed created successfully");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
