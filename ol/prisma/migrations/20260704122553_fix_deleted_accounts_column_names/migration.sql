/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `deleted_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `deletedByIp` on the `deleted_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `miningBalance` on the `deleted_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `tradingBalance` on the `deleted_accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "deleted_accounts" DROP COLUMN "deletedAt",
DROP COLUMN "deletedByIp",
DROP COLUMN "miningBalance",
DROP COLUMN "tradingBalance",
ADD COLUMN     "deleted_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_by_ip" VARCHAR(45),
ADD COLUMN     "mining_balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trading_balance" DECIMAL(10,2) NOT NULL DEFAULT 0;
