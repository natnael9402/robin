-- CreateTable
CREATE TABLE "deleted_accounts" (
    "id" BIGSERIAL NOT NULL,
    "original_user_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(255),
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tradingBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "miningBalance" INTEGER NOT NULL DEFAULT 0,
    "role" "users_role" NOT NULL DEFAULT 'user',
    "reason" TEXT,
    "deletedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedByIp" VARCHAR(45),

    CONSTRAINT "deleted_accounts_pkey" PRIMARY KEY ("id")
);
