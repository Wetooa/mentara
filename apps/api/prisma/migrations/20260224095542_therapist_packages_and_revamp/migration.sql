/*
  Warnings:

  - You are about to drop the column `assessmentTools` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `isPRCLicensed` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `professionalLiabilityInsurance` on the `Therapist` table. All the data in the column will be lost.
  - Changed the type of `providerType` on the `Therapist` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'FULLY_USED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('LICENSED_PSYCHOLOGIST', 'LICENSED_GUIDANCE_COUNSELOR');

-- AlterTable
ALTER TABLE "Therapist" DROP COLUMN "assessmentTools",
DROP COLUMN "isPRCLicensed",
DROP COLUMN "professionalLiabilityInsurance",
ADD COLUMN     "otherAreaOfExpertise" TEXT,
ADD COLUMN     "preferOnlineOrOffline" TEXT,
ADD COLUMN     "preferredPayrollAccount" TEXT,
ADD COLUMN     "willingToCaterOutsideCebu" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "providerType",
ADD COLUMN     "providerType" "ProviderType" NOT NULL;

-- CreateTable
CREATE TABLE "Therapist_Packages" (
    "packageId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sessionCount" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "features" JSONB,
    "status" "PackageStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',

    CONSTRAINT "Therapist_Packages_pkey" PRIMARY KEY ("packageId")
);

-- CreateTable
CREATE TABLE "User_Subscriptions" (
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionsRemaining" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "User_Subscriptions_pkey" PRIMARY KEY ("subscriptionId")
);

-- CreateTable
CREATE TABLE "Session_Logs" (
    "logId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "deductedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_Logs_pkey" PRIMARY KEY ("logId")
);

-- CreateIndex
CREATE INDEX "Therapist_Packages_therapistId_idx" ON "Therapist_Packages"("therapistId");

-- CreateIndex
CREATE INDEX "Therapist_Packages_status_idx" ON "Therapist_Packages"("status");

-- CreateIndex
CREATE INDEX "User_Subscriptions_userId_idx" ON "User_Subscriptions"("userId");

-- CreateIndex
CREATE INDEX "User_Subscriptions_packageId_idx" ON "User_Subscriptions"("packageId");

-- CreateIndex
CREATE INDEX "User_Subscriptions_status_idx" ON "User_Subscriptions"("status");

-- CreateIndex
CREATE INDEX "Session_Logs_subscriptionId_idx" ON "Session_Logs"("subscriptionId");

-- CreateIndex
CREATE INDEX "Session_Logs_appointmentId_idx" ON "Session_Logs"("appointmentId");

-- AddForeignKey
ALTER TABLE "Therapist_Packages" ADD CONSTRAINT "Therapist_Packages_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Subscriptions" ADD CONSTRAINT "User_Subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Subscriptions" ADD CONSTRAINT "User_Subscriptions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Therapist_Packages"("packageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session_Logs" ADD CONSTRAINT "Session_Logs_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "User_Subscriptions"("subscriptionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session_Logs" ADD CONSTRAINT "Session_Logs_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
