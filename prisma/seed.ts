import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 ດຳເນີນການສ້າງ Seed data...");

  // 1. ສ້າງ Roles ພື້ນຖານ (ADMIN, EMPLOYEE, CASHIER, USER)
  // ໃຊ້ upsert ເພື່ອປ້ອງກັນການສ້າງຊ້ຳຖ້າມີຂໍ້ມູນຢູ່ແລ້ວ
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: "EMPLOYEE" },
    update: {},
    create: { name: "EMPLOYEE" },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: "CASHIER" },
    update: {},
    create: { name: "CASHIER" },
  });

  await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" },
  });

  console.log("✅ ສ້າງ Roles ເສັດສິ້ນ: ADMIN, EMPLOYEE, CASHIER, USER");

  // 2. ສ້າງບັດຊີ ADMIN ຫຼັກ ແລະ ຜູກກັບ adminRole.id
  const adminUsername = "admin";
  const adminPassword = "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      name: "Super Admin",
      password: hashedPassword,
      roleId: adminRole.id, // ຜູກ ID ຈາກ Table Role ທີ່ສ້າງດ້ານເທິງ
    },
    create: {
      username: adminUsername,
      password: hashedPassword,
      name: "Super Admin",
      roleId: adminRole.id,
    },
  });

  console.log(`✅ ບັງຄັບບັນຊີ Admin ສຳເລັດ: ${adminUsername} / ${adminPassword}`);

  // 3. ສ້າງຂໍ້ມູນ Categories ຕົວຢ່າງ
  const catSmartphone = await prisma.category.upsert({
    where: { name: "Smartphone" },
    update: {},
    create: { name: "Smartphone" },
  });

  const catLaptop = await prisma.category.upsert({
    where: { name: "Laptop" },
    update: {},
    create: { name: "Laptop" },
  });

  // 4. ສ້າງຂໍ້ມູນ Brands ຕົວຢ່າງ
  const brandApple = await prisma.brand.upsert({
    where: { name: "Apple" },
    update: {},
    create: { name: "Apple" },
  });

  const brandSamsung = await prisma.brand.upsert({
    where: { name: "Samsung" },
    update: {},
    create: { name: "Samsung" },
  });

  // 5. Screate ຂໍ້ມູນ Spec Attributes ( RAM, Storage )
  await prisma.specAttribute.upsert({
    where: { name: "RAM" },
    update: {},
    create: { name: "RAM" },
  });

  await prisma.specAttribute.upsert({
    where: { name: "Storage" },
    update: {},
    create: { name: "Storage" },
  });

  console.log("✅ ສ້າງຂໍ້ມູນພື້ນຖານ (Brands, Categories, Specs) ເສັດສິ້ນ");
  console.log("🎉 ທຸກຢ່າງພ້ອມໃຊ້ງານແລ້ວ!");
}

main()
  .catch((e) => {
    console.error("❌ ເກີດຂໍ້ຜິດພາດໃນການ Seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
