import "dotenv/config";
import { pool } from "../src/config/db.js";

async function main() {
  console.log("ກຳລັງລຶບຂໍ້ມູນລາຍການຂາຍ ແລະ ສິນຄ້າ (Mock Data) ອອກ...");
  await pool.query(`DELETE FROM "OrderItemItem"`);
  await pool.query(`DELETE FROM "OrderItem"`);
  await pool.query(`DELETE FROM "Order"`);
  await pool.query(`DELETE FROM "StockItem"`);
  await pool.query(`DELETE FROM "ProductVariant"`);
  await pool.query(`DELETE FROM "ProductImage"`);
  await pool.query(`DELETE FROM "ProductSpec"`);
  await pool.query(`DELETE FROM "Product"`);
  console.log("✅ ລຶບຂໍ້ມູນ Mock ຖິ້ມສຳເລັດແລ້ວ!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => pool.end());
