/*
  Warnings:

  - Added the required column `createdBy` to the `AwardedCertificate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CertificateCreated', 'CertificateAwarded');

-- AlterTable
ALTER TABLE "AwardedCertificate" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "type" "ActivityType" NOT NULL,
    "actor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orgId" INTEGER,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrganizationAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
