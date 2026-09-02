import "dotenv/config";
import bcrypt from "bcrypt";
import { pool } from "../src/config/db.js";

async function upsertRole(name: string) {
  const { rows } = await pool.query(
    `INSERT INTO "Role" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING RETURNING *`,
    [name]
  );
  if (rows[0]) return rows[0];
  const { rows: existing } = await pool.query(`SELECT * FROM "Role" WHERE "name" = $1`, [name]);
  return existing[0];
}

async function upsertByName(table: string, name: string) {
  const { rows } = await pool.query(
    `INSERT INTO "${table}" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING RETURNING *`,
    [name]
  );
  if (rows[0]) return rows[0];
  const { rows: existing } = await pool.query(`SELECT * FROM "${table}" WHERE "name" = $1`, [name]);
  return existing[0];
}

async function main() {
  console.log("🌱 ດຳເນີນການສ້າງ Seed data (Supabase pg, no Prisma)...");

  const adminRole = await upsertRole("ADMIN");
  await upsertRole("EMPLOYEE");
  await upsertRole("CASHIER");
  await upsertRole("USER");
  console.log("✅ ສ້າງ Roles ເສັດສິ້ນ: ADMIN, EMPLOYEE, CASHIER, USER");

  const adminUsername = "admin";
  const adminPassword = "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const { rows: existingAdmin } = await pool.query(`SELECT * FROM "User" WHERE "username" = $1`, [adminUsername]);
  if (existingAdmin[0]) {
    await pool.query(`UPDATE "User" SET "name" = $1, "password" = $2, "roleId" = $3, "updatedAt" = NOW() WHERE "username" = $4`, [
      "Super Admin",
      hashedPassword,
      adminRole.id,
      adminUsername,
    ]);
  } else {
    await pool.query(`INSERT INTO "User" ("username", "password", "name", "roleId", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,NOW(),NOW())`, [
      adminUsername,
      hashedPassword,
      "Super Admin",
      adminRole.id,
    ]);
  }
  console.log(`✅ ບັງຄັບບັນຊີ Admin ສຳເລັດ: ${adminUsername} / ${adminPassword}`);

  await upsertByName("Category", "Smartphone");
  await upsertByName("Category", "Laptop");
  await upsertByName("Brand", "Apple");
  await upsertByName("Brand", "Samsung");
  await upsertByName("SpecAttribute", "RAM");
  await upsertByName("SpecAttribute", "Storage");

  console.log("✅ ສ້າງຂໍ້ມູນພື້ນຖານ (Brands, Categories, Specs) ເສັດສິ້ນ");
  console.log("🎉 ທຸກຢ່າງພ້ອມໃຊ້ງານແລ້ວ!");
}

main()
  .catch((e) => {
    console.error("❌ ເກີດຂໍ້ຜິດພາດໃນການ Seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
