/*
  Warnings:

  - Added the required column `employementIndex` to the `Employees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employees" ADD COLUMN     "employementIndex" INTEGER NOT NULL;
