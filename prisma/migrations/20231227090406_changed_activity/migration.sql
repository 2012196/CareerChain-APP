/*
  Warnings:

  - You are about to drop the column `actor` on the `Activity` table. All the data in the column will be lost.
  - Added the required column `actorId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Made the column `orgId` on table `Activity` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_orgId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "actor",
ADD COLUMN     "actorId" INTEGER NOT NULL,
ALTER COLUMN "orgId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrganizationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
