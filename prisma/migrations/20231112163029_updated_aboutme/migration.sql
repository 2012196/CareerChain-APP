/*
  Warnings:

  - Made the column `aboutMe` on table `PersonalAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PersonalAccount" ALTER COLUMN "aboutMe" SET NOT NULL,
ALTER COLUMN "aboutMe" SET DEFAULT 'Hey, I am new here nice to meet you';
