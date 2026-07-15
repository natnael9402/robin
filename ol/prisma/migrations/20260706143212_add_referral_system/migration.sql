-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "referred_by_id" BIGINT;

-- CreateTable
CREATE TABLE "referral_commissions" (
    "id" BIGSERIAL NOT NULL,
    "referrer_profile_id" BIGINT NOT NULL,
    "referred_user_id" BIGINT NOT NULL,
    "deposit_id" BIGINT NOT NULL,
    "deposit_amount" DECIMAL(15,2) NOT NULL,
    "commission_amount" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'paid',
    "paid_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "referral_commissions_referrer_profile_id_idx" ON "referral_commissions"("referrer_profile_id");

-- CreateIndex
CREATE INDEX "referral_commissions_referred_user_id_idx" ON "referral_commissions"("referred_user_id");

-- CreateIndex
CREATE INDEX "referral_commissions_deposit_id_idx" ON "referral_commissions"("deposit_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_referrer_profile_id_fkey" FOREIGN KEY ("referrer_profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "deposits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
