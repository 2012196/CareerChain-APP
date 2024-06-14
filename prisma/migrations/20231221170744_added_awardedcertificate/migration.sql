/*
  Warnings:

  - You are about to drop the column `createdAt` on the `PersonalAccount` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PersonalAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PersonalAccount" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "AwardedCertificate" (
    "id" SERIAL NOT NULL,
    "orgCertId" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "orgId" INTEGER NOT NULL,
    "personalId" INTEGER NOT NULL,

    CONSTRAINT "AwardedCertificate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AwardedCertificate" ADD CONSTRAINT "AwardedCertificate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrganizationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwardedCertificate" ADD CONSTRAINT "AwardedCertificate_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "PersonalAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
