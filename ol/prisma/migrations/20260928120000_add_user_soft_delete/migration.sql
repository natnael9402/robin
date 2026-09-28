-- Admin user soft delete (PostgreSQL).
--
-- 1. Adds `users.deleted_at` so an admin delete archives instead of destroying.
-- 2. Creates `deleted_accounts` defensively: the table was introduced by
--    20260704122039 + 20260704122553, but environments restored from a pg_dump
--    (which is how every deployed environment here was built) may never have
--    those tables. IF NOT EXISTS keeps this safe either way.
-- 3. Re-points `referral_commissions.referred_user_id` to ON DELETE CASCADE.
--    schema.prisma declares Cascade, but 20260706143212 created it as RESTRICT,
--    so `prisma.user.delete()` fails with P2003 for a user who has been
--    referred. Guarded by a DO block because dumps built from schema.prisma
--    already have CASCADE and re-adding the constraint would be wasted work.
--
-- NOT changed here: `trades.closed_by` stays ON DELETE RESTRICT. It is
-- detached inside the purge transaction instead (see
-- dist/profile/profile.admin.user-delete.service.js) so an ordinary user delete
-- still records who force-closed a trade.

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(0);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateTable (idempotent: matches 20260704122039 as corrected by
-- 20260704122553, plus the fast-trade / spot / deleted_by columns added here)
CREATE TABLE IF NOT EXISTS "deleted_accounts" (
    "id" BIGSERIAL NOT NULL,
    "original_user_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(255),
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "fast_trade_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "spot_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "trading_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "mining_balance" INTEGER NOT NULL DEFAULT 0,
    "role" "public"."users_role" NOT NULL DEFAULT 'user',
    "reason" TEXT,
    "deleted_by" BIGINT,
    "deleted_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by_ip" VARCHAR(45),

    CONSTRAINT "deleted_accounts_pkey" PRIMARY KEY ("id")
);

-- Add the archive columns only when the table already existed without them.
ALTER TABLE "deleted_accounts" ADD COLUMN IF NOT EXISTS "fast_trade_balance" DECIMAL(15,2) NOT NULL DEFAULT 0;
ALTER TABLE "deleted_accounts" ADD COLUMN IF NOT EXISTS "spot_balance" DECIMAL(15,2) NOT NULL DEFAULT 0;
ALTER TABLE "deleted_accounts" ADD COLUMN IF NOT EXISTS "deleted_by" BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "deleted_accounts_original_user_id_key" ON "deleted_accounts"("original_user_id");
CREATE INDEX IF NOT EXISTS "deleted_accounts_deleted_at_idx" ON "deleted_accounts"("deleted_at");

-- Re-point the referral foreign key at CASCADE only if it is still restrictive.
DO $$
DECLARE
    current_rule TEXT;
BEGIN
    SELECT rc.delete_rule INTO current_rule
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_class ref ON ref.oid = con.confrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    JOIN information_schema.referential_constraints rc
      ON rc.constraint_name = con.conname AND rc.constraint_schema = nsp.nspname
    WHERE con.contype = 'f'
      AND rel.relname = 'referral_commissions'
      AND ref.relname = 'users'
      AND con.conname = 'referral_commissions_referred_user_id_fkey';

    IF current_rule IS NOT NULL AND current_rule <> 'CASCADE' THEN
        EXECUTE 'ALTER TABLE "referral_commissions" DROP CONSTRAINT "referral_commissions_referred_user_id_fkey"';
        EXECUTE 'ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users"("id") ON DELETE CASCADE';
    END IF;
END $$;
