/*
  Warnings:

  - You are about to drop the column `hash` on the `Certificate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "hash",
ADD COLUMN     "transactionHash" TEXT;
