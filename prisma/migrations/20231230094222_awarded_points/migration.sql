-- CreateTable
CREATE TABLE "AwardedPoints" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "orgId" INTEGER NOT NULL,
    "personalId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AwardedPoints_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AwardedPoints" ADD CONSTRAINT "AwardedPoints_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrganizationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwardedPoints" ADD CONSTRAINT "AwardedPoints_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "PersonalAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
