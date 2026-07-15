-- CreateTable
CREATE TABLE "news_articles" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "image_url" VARCHAR(500),
    "author" VARCHAR(255) NOT NULL DEFAULT 'Robin Trade',
    "source" VARCHAR(50) NOT NULL DEFAULT 'manual',
    "source_url" VARCHAR(500),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");

-- CreateIndex
CREATE INDEX "news_articles_source_idx" ON "news_articles"("source");

-- CreateIndex
CREATE INDEX "news_articles_is_published_published_at_idx" ON "news_articles"("is_published", "published_at");
