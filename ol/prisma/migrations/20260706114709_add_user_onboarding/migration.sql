-- CreateTable
CREATE TABLE "user_onboardings" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "income_source" VARCHAR(100) NOT NULL,
    "annual_income" VARCHAR(50) NOT NULL,
    "employment_status" VARCHAR(100) NOT NULL,
    "investment_goal" VARCHAR(200),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "user_onboardings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_onboardings_user_id_key" ON "user_onboardings"("user_id");

-- CreateIndex
CREATE INDEX "user_onboardings_user_id_idx" ON "user_onboardings"("user_id");

-- AddForeignKey
ALTER TABLE "user_onboardings" ADD CONSTRAINT "user_onboardings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
