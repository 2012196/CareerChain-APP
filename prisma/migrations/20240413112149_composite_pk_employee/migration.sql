/*
  Warnings:

  - The primary key for the `Employees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[employementIndex]` on the table `Employees` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Employees" DROP CONSTRAINT "Employees_pkey",
ADD CONSTRAINT "Employees_pkey" PRIMARY KEY ("orgId", "employementIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_employementIndex_key" ON "Employees"("employementIndex");
