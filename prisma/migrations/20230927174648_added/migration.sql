/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "country" TEXT,
    "account_type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalAccount" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "account_id" INTEGER NOT NULL,

    CONSTRAINT "PersonalAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationAccount" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,

    CONSTRAINT "OrganizationAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalAccount_account_id_key" ON "PersonalAccount"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationAccount_account_id_key" ON "OrganizationAccount"("account_id");

-- AddForeignKey
ALTER TABLE "PersonalAccount" ADD CONSTRAINT "PersonalAccount_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationAccount" ADD CONSTRAINT "OrganizationAccount_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
