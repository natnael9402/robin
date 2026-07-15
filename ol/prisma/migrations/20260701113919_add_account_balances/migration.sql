-- CreateTable
CREATE TABLE "account_balances" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "account_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_balances_user_id_type_key" ON "account_balances"("user_id", "type");

-- AddForeignKey
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
