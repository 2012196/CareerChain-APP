/*
  Warnings:

  - Added the required column `industryType` to the `OrganizationAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrganizationAccount" ADD COLUMN     "industryType" TEXT NOT NULL;
