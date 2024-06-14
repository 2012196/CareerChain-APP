-- CreateTable
CREATE TABLE "Employees" (
    "id" SERIAL NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "orgId" INTEGER NOT NULL,
    "personalId" INTEGER NOT NULL,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrganizationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "PersonalAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
