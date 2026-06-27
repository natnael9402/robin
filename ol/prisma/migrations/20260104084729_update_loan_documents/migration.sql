/*
  Warnings:

  - You are about to drop the column `document_url` on the `loans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "loans" DROP COLUMN "document_url",
ADD COLUMN     "back_image" VARCHAR(255),
ADD COLUMN     "document_type" VARCHAR(255),
ADD COLUMN     "front_image" VARCHAR(255);
