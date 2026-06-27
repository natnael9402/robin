-- CreateEnum
CREATE TYPE "loans_status" AS ENUM ('pending', 'approved', 'rejected', 'repaid', 'overdue');

-- CreateTable
CREATE TABLE "loans" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(255) NOT NULL DEFAULT 'USDT',
    "status" "loans_status" NOT NULL DEFAULT 'pending',
    "document_url" VARCHAR(255),
    "rejection_reason" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "interest_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "total_payable" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "accumulated_interest" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "last_interest_date" TIMESTAMP(0),
    "due_date" TIMESTAMP(0),
    "approved_at" TIMESTAMP(0),
    "repaid_at" TIMESTAMP(0),
    "processed_by" BIGINT,
    "processed_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loans_processed_by_idx" ON "loans"("processed_by");

-- CreateIndex
CREATE INDEX "loans_user_id_idx" ON "loans"("user_id");

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
