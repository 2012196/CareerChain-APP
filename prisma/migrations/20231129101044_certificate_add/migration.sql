-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "orgCertId" INTEGER NOT NULL,
    "hash" TEXT,
    "orgId" INTEGER NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrganizationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
