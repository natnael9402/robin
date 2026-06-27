-- CreateEnum
CREATE TYPE "loan_repayments_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "loan_repayments" (
    "id" BIGSERIAL NOT NULL,
    "loan_id" BIGINT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "proof_image" VARCHAR(255) NOT NULL,
    "status" "loan_repayments_status" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "processed_by" BIGINT,
    "processed_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "loan_repayments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loan_repayments_loan_id_idx" ON "loan_repayments"("loan_id");

-- CreateIndex
CREATE INDEX "loan_repayments_processed_by_idx" ON "loan_repayments"("processed_by");

-- AddForeignKey
ALTER TABLE "loan_repayments" ADD CONSTRAINT "loan_repayments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "loan_repayments" ADD CONSTRAINT "loan_repayments_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;
