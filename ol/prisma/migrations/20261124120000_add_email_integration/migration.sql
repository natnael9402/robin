-- Email integration (verification + admin studio).
--
-- Deployed databases are restored from full_dump.sql, so every statement here is
-- idempotent. `signup_site` lets us send each user email from the site they
-- registered on; `email_logs` backs the admin studio history and per-recipient
-- delivery status.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "signup_site" VARCHAR(20);

CREATE TABLE IF NOT EXISTS "email_logs" (
    "id" BIGSERIAL NOT NULL,
    "campaign_id" VARCHAR(36) NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "user_id" BIGINT,
    "admin_id" BIGINT,
    "email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "site" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "error" TEXT,
    "sent_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "email_logs_campaign_id_idx" ON "email_logs"("campaign_id");
CREATE INDEX IF NOT EXISTS "email_logs_type_created_at_idx" ON "email_logs"("type", "created_at");
CREATE INDEX IF NOT EXISTS "email_logs_user_id_idx" ON "email_logs"("user_id");
