import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("ກຳລັງລຶບຂໍ້ມູນລາຍການຂາຍ ແລະ ສິນຄ້າ (Mock Data) ອອກ...");

  // ລຶບຂໍ້ມູນທັງໝົດທີ່ກ່ຽວກັບການຂາຍ ແລະ ສິນຄ້າ
  await prisma.orderItemItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.stockItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});

  console.log("✅ ລຶບຂໍ້ມູນ Mock ຖິ້ມສຳເລັດແລ້ວ! ຖານຂໍ້ມູນກັບມາວ່າງເປົ່າເໝືອນເດີມ.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
