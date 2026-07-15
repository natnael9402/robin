"use strict";
// One-time migration: ensure every user has fast_trade, spot, trading account_balances rows.
// Run with: node dist/utils/backfill-accounts.js
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../prisma");
const ACCOUNT_TYPES = ["fast_trade", "spot", "trading"];

async function main() {
  const users = await prisma_1.default.user.findMany({ select: { id: true } });
  console.log(`Found ${users.length} users. Checking account balances...`);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    for (const type of ACCOUNT_TYPES) {
      const existing = await prisma_1.default.accountBalance.findUnique({
        where: { user_id_type: { user_id: user.id, type } },
      });
      if (!existing) {
        await prisma_1.default.accountBalance.create({
          data: { user_id: user.id, type, balance: 0 },
        });
        created++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`Done. Created ${created} missing rows, skipped ${skipped} existing rows.`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma_1.default.$disconnect();
  });
