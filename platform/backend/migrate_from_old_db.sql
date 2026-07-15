-- ============================================================
-- Run this AFTER restoring db_backup.sql into your local DB
-- Adds columns that exist in platform/backend but not in the
-- original "base-trade" DB dump
-- ============================================================

-- 1. Extra columns on users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_admin          BOOLEAN          NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified       BOOLEAN          NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS withdraw_password CHARACTER VARYING(255) NULL,
  ADD COLUMN IF NOT EXISTS trade_mode        CHARACTER VARYING(20)  NOT NULL DEFAULT 'ALWAYS_LOSS',
  ADD COLUMN IF NOT EXISTS trading_balance   NUMERIC(10,2)    NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS mining_balance    INTEGER          NOT NULL DEFAULT 0;

-- 2. Sync is_admin from role (admins in old DB had role = 'admin')
UPDATE public.users SET is_admin = true WHERE role = 'admin';

-- 3. New tables not in old DB (TypeORM won't create these if synchronize=false)
--    chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message    TEXT NOT NULL,
    is_admin   BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);
