/*
  Warnings:

  - Added the required column `transactionHash` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "transactionHash" TEXT NOT NULL;
