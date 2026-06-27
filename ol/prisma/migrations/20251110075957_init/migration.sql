-- CreateEnum
CREATE TYPE "public"."profiles_kyc_status" AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "public"."support_tickets_status" AS ENUM ('open', 'in_progress', 'awaiting_user', 'closed');

-- CreateEnum
CREATE TYPE "public"."arbitrage_hostings_status" AS ENUM ('running', 'ended', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."mining_hostings_status" AS ENUM ('running', 'ended', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."support_tickets_priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "public"."users_role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "public"."kyc_submissions_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."users_status" AS ENUM ('active', 'inactive', 'suspended', 'banned');

-- CreateEnum
CREATE TYPE "public"."deposits_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."withdrawals_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."profiles_trade_status" AS ENUM ('win', 'loss', 'normal');

-- CreateTable
CREATE TABLE "public"."arbitrage_hostings" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "public"."arbitrage_hostings_status" NOT NULL DEFAULT 'running',
    "currency" VARCHAR(255) NOT NULL DEFAULT 'USDT',
    "start_date" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(0),
    "last_profit_date" TIMESTAMP(0),
    "total_earned" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "arbitrage_hostings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."arbitrage_products" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "days" INTEGER NOT NULL,
    "daily_rate" DECIMAL(10,2) NOT NULL,
    "min_amount" DECIMAL(14,2) NOT NULL,
    "max_amount" DECIMAL(14,2) NOT NULL,
    "image" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "supported_currencies" TEXT,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "arbitrage_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assets" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100),
    "amount" DECIMAL(20,8) NOT NULL,
    "current_price" DECIMAL(20,8),
    "current_value" DECIMAL(20,2),
    "avg_purchase_price" DECIMAL(20,8),
    "last_updated_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cache" (
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."cache_locks" (
    "key" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255) NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_locks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."crypto_addresses" (
    "id" BIGSERIAL NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "network" VARCHAR(20) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "qr_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "last_updated" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "crypto_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deposits" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "currency" VARCHAR(255) NOT NULL DEFAULT 'USDT',
    "amount" DECIMAL(15,2) NOT NULL,
    "transaction_id" VARCHAR(255),
    "payment_method" VARCHAR(255) NOT NULL,
    "payment_details" VARCHAR(255),
    "description" TEXT,
    "proof_image" VARCHAR(255),
    "status" "public"."deposits_status" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "processed_by" BIGINT,
    "processed_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."failed_jobs" (
    "id" BIGSERIAL NOT NULL,
    "uuid" VARCHAR(255) NOT NULL,
    "connection" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "exception" TEXT NOT NULL,
    "failed_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_batches" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "total_jobs" INTEGER NOT NULL,
    "pending_jobs" INTEGER NOT NULL,
    "failed_jobs" INTEGER NOT NULL,
    "failed_job_ids" TEXT NOT NULL,
    "options" TEXT,
    "cancelled_at" INTEGER,
    "created_at" INTEGER NOT NULL,
    "finished_at" INTEGER,

    CONSTRAINT "job_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" BIGSERIAL NOT NULL,
    "queue" VARCHAR(255) NOT NULL,
    "payload" TEXT NOT NULL,
    "attempts" SMALLINT NOT NULL,
    "reserved_at" INTEGER,
    "available_at" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kyc_submissions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "document_type" VARCHAR(255) NOT NULL,
    "document_number" VARCHAR(255),
    "front_image_url" VARCHAR(255),
    "back_image_url" VARCHAR(255),
    "selfie_image_url" VARCHAR(255),
    "status" "public"."kyc_submissions_status" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(0),
    "rejected_at" TIMESTAMP(0),
    "processed_by" BIGINT,
    "processed_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "kyc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."migrations" (
    "id" SERIAL NOT NULL,
    "migration" VARCHAR(255) NOT NULL,
    "batch" INTEGER NOT NULL,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mining_hostings" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "public"."mining_hostings_status" NOT NULL DEFAULT 'running',
    "currency" VARCHAR(255) NOT NULL DEFAULT 'USDT',
    "start_date" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(0),
    "last_profit_date" TIMESTAMP(0),
    "total_earned" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "mining_hostings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mining_products" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "days" INTEGER NOT NULL,
    "daily_rate" DECIMAL(10,2) NOT NULL,
    "min_amount" DECIMAL(14,2) NOT NULL,
    "max_amount" DECIMAL(14,2) NOT NULL,
    "limit_times" INTEGER NOT NULL,
    "hashrate" VARCHAR(255) NOT NULL,
    "power" VARCHAR(255) NOT NULL,
    "network_type" VARCHAR(255) NOT NULL,
    "manufacturer" VARCHAR(255),
    "size" VARCHAR(255),
    "weight" VARCHAR(255),
    "temperature" VARCHAR(255),
    "humidity" VARCHAR(255),
    "image" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "mining_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "public"."personal_access_tokens" (
    "id" BIGSERIAL NOT NULL,
    "tokenable_type" VARCHAR(255) NOT NULL,
    "tokenable_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "abilities" TEXT,
    "last_used_at" TIMESTAMP(0),
    "expires_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "personal_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "kyc_status" "public"."profiles_kyc_status" NOT NULL DEFAULT 'unverified',
    "level" SMALLINT NOT NULL DEFAULT 1,
    "kyc_documents" TEXT,
    "bank_account" VARCHAR(255),
    "blockchain_addresses" TEXT,
    "google_auth_enabled" BOOLEAN NOT NULL DEFAULT false,
    "google_auth_secret" VARCHAR(255),
    "withdrawal_password_enabled" BOOLEAN NOT NULL DEFAULT false,
    "withdrawal_password" VARCHAR(255),
    "trade_status" "public"."profiles_trade_status",
    "total_assets" DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
    "preferred_language" VARCHAR(255) NOT NULL DEFAULT 'en',
    "notification_settings" TEXT,
    "sim_trade_enabled" BOOLEAN NOT NULL DEFAULT false,
    "invite_code" VARCHAR(255),
    "referral_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" BIGINT,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "payload" TEXT NOT NULL,
    "last_activity" INTEGER NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."support_ticket_messages" (
    "id" BIGSERIAL NOT NULL,
    "ticket_id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "admin_id" BIGINT,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."support_tickets" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "status" "public"."support_tickets_status" NOT NULL DEFAULT 'open',
    "priority" "public"."support_tickets_priority" NOT NULL DEFAULT 'medium',
    "category" VARCHAR(255) NOT NULL,
    "last_reply_at" TIMESTAMP(0),
    "closed_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trade_contracts" (
    "id" BIGSERIAL NOT NULL,
    "trade_id" BIGINT NOT NULL,
    "quantity" DECIMAL(15,8) NOT NULL,
    "leverage" INTEGER NOT NULL,
    "liquidation_price" DECIMAL(15,8) NOT NULL,
    "take_profit" DECIMAL(15,8),
    "stop_loss" DECIMAL(15,8),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "trade_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trade_options" (
    "id" BIGSERIAL NOT NULL,
    "trade_id" BIGINT NOT NULL,
    "duration" INTEGER NOT NULL,
    "return_rate" DECIMAL(5,2) NOT NULL,
    "expected_return" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "trade_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trade_spots" (
    "id" BIGSERIAL NOT NULL,
    "trade_id" BIGINT NOT NULL,
    "quantity" DECIMAL(15,8) NOT NULL,
    "market_price" DECIMAL(15,8) NOT NULL,
    "exchange_rate" DECIMAL(20,12),
    "from_coin" VARCHAR(10),
    "to_coin" VARCHAR(10),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "trade_spots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trades" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "symbol" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "direction" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "entry_price" DECIMAL(15,8) NOT NULL,
    "exit_price" DECIMAL(15,8),
    "exchange_rate" DECIMAL(18,8),
    "from_coin" VARCHAR(20),
    "to_coin" VARCHAR(20),
    "status" VARCHAR(255) NOT NULL DEFAULT 'open',
    "result" VARCHAR(255),
    "pnl" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "fee" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "opened_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(0),
    "closed_by" BIGINT,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "trade_id" BIGINT,
    "type" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(255) NOT NULL DEFAULT 'USDT',
    "balance" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(255),
    "email_verified_at" TIMESTAMP(0),
    "password" VARCHAR(255) NOT NULL,
    "role" "public"."users_role" NOT NULL DEFAULT 'user',
    "status" "public"."users_status" NOT NULL DEFAULT 'active',
    "remember_token" VARCHAR(100),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."withdrawals" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "currency" VARCHAR(255) NOT NULL DEFAULT 'USDT',
    "amount" DECIMAL(15,2) NOT NULL,
    "fee" DECIMAL(15,8) NOT NULL DEFAULT 0.00000000,
    "transaction_id" VARCHAR(255),
    "wallet_address" VARCHAR(255),
    "network" VARCHAR(20) NOT NULL DEFAULT 'TRC20',
    "bank_details" VARCHAR(255),
    "description" TEXT,
    "status" "public"."withdrawals_status" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "processed_by" BIGINT,
    "processed_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "arbitrage_hostings_product_id_idx" ON "public"."arbitrage_hostings"("product_id");

-- CreateIndex
CREATE INDEX "arbitrage_hostings_user_id_idx" ON "public"."arbitrage_hostings"("user_id");

-- CreateIndex
CREATE INDEX "assets_symbol_idx" ON "public"."assets"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "assets_user_id_symbol_key" ON "public"."assets"("user_id", "symbol");

-- CreateIndex
CREATE INDEX "crypto_addresses_created_by_idx" ON "public"."crypto_addresses"("created_by");

-- CreateIndex
CREATE INDEX "crypto_addresses_updated_by_idx" ON "public"."crypto_addresses"("updated_by");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_addresses_currency_network_is_active_key" ON "public"."crypto_addresses"("currency", "network", "is_active");

-- CreateIndex
CREATE INDEX "deposits_processed_by_idx" ON "public"."deposits"("processed_by");

-- CreateIndex
CREATE INDEX "deposits_user_id_idx" ON "public"."deposits"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" ON "public"."failed_jobs"("uuid");

-- CreateIndex
CREATE INDEX "jobs_queue_idx" ON "public"."jobs"("queue");

-- CreateIndex
CREATE INDEX "kyc_submissions_processed_by_idx" ON "public"."kyc_submissions"("processed_by");

-- CreateIndex
CREATE INDEX "kyc_submissions_user_id_idx" ON "public"."kyc_submissions"("user_id");

-- CreateIndex
CREATE INDEX "mining_hostings_product_id_idx" ON "public"."mining_hostings"("product_id");

-- CreateIndex
CREATE INDEX "mining_hostings_user_id_idx" ON "public"."mining_hostings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" ON "public"."personal_access_tokens"("token");

-- CreateIndex
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_idx" ON "public"."personal_access_tokens"("tokenable_type", "tokenable_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_uuid_unique" ON "public"."profiles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_invite_code_unique" ON "public"."profiles"("invite_code");

-- CreateIndex
CREATE INDEX "profiles_user_id_idx" ON "public"."profiles"("user_id");

-- CreateIndex
CREATE INDEX "sessions_last_activity_idx" ON "public"."sessions"("last_activity");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "public"."sessions"("user_id");

-- CreateIndex
CREATE INDEX "support_ticket_messages_admin_id_idx" ON "public"."support_ticket_messages"("admin_id");

-- CreateIndex
CREATE INDEX "support_ticket_messages_ticket_id_created_at_idx" ON "public"."support_ticket_messages"("ticket_id", "created_at");

-- CreateIndex
CREATE INDEX "support_ticket_messages_user_id_idx" ON "public"."support_ticket_messages"("user_id");

-- CreateIndex
CREATE INDEX "support_tickets_user_id_idx" ON "public"."support_tickets"("user_id");

-- CreateIndex
CREATE INDEX "trade_contracts_trade_id_idx" ON "public"."trade_contracts"("trade_id");

-- CreateIndex
CREATE INDEX "trade_options_trade_id_idx" ON "public"."trade_options"("trade_id");

-- CreateIndex
CREATE INDEX "trade_spots_trade_id_idx" ON "public"."trade_spots"("trade_id");

-- CreateIndex
CREATE INDEX "trades_closed_by_idx" ON "public"."trades"("closed_by");

-- CreateIndex
CREATE INDEX "trades_user_id_idx" ON "public"."trades"("user_id");

-- CreateIndex
CREATE INDEX "transactions_trade_id_idx" ON "public"."transactions"("trade_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "public"."transactions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_unique" ON "public"."users"("phone");

-- CreateIndex
CREATE INDEX "withdrawals_processed_by_idx" ON "public"."withdrawals"("processed_by");

-- CreateIndex
CREATE INDEX "withdrawals_user_id_idx" ON "public"."withdrawals"("user_id");

-- AddForeignKey
ALTER TABLE "public"."arbitrage_hostings" ADD CONSTRAINT "arbitrage_hostings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."arbitrage_products"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."arbitrage_hostings" ADD CONSTRAINT "arbitrage_hostings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."crypto_addresses" ADD CONSTRAINT "crypto_addresses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."crypto_addresses" ADD CONSTRAINT "crypto_addresses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."deposits" ADD CONSTRAINT "deposits_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."deposits" ADD CONSTRAINT "deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."kyc_submissions" ADD CONSTRAINT "kyc_submissions_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."kyc_submissions" ADD CONSTRAINT "kyc_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."mining_hostings" ADD CONSTRAINT "mining_hostings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."mining_products"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."mining_hostings" ADD CONSTRAINT "mining_hostings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."trade_contracts" ADD CONSTRAINT "trade_contracts_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."trade_options" ADD CONSTRAINT "trade_options_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."trade_spots" ADD CONSTRAINT "trade_spots_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."trades" ADD CONSTRAINT "trades_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."trades" ADD CONSTRAINT "trades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."withdrawals" ADD CONSTRAINT "withdrawals_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "public"."withdrawals" ADD CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
