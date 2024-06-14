/*
  Warnings:

  - You are about to drop the column `industryType` on the `OrganizationAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "profileImage" TEXT;

-- AlterTable
ALTER TABLE "OrganizationAccount" DROP COLUMN "industryType";
