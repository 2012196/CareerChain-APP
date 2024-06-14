-- AlterTable
ALTER TABLE "OrganizationAccount" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" SERIAL NOT NULL,
    "verificationKey" TEXT NOT NULL,
    "orgId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_orgId_key" ON "VerificationRequest"("orgId");

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrganizationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
