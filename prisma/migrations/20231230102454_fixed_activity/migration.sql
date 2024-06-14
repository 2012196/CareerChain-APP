-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'PointsAwarded';

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "reason" TEXT;
