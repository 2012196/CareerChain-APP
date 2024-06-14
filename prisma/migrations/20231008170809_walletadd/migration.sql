/*
  Warnings:

  - A unique constraint covering the columns `[walletAddress]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `walletAddress` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "walletAddress" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_walletAddress_key" ON "Account"("walletAddress");
