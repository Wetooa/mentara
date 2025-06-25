/*
  Warnings:

  - You are about to drop the column `therapistId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AdminUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Therapist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Therapist" DROP CONSTRAINT "Therapist_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "Worksheet" DROP CONSTRAINT "Worksheet_therapistId_fkey";

-- DropIndex
DROP INDEX "User_therapistId_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "therapistId",
ADD COLUMN     "assignedTherapistId" TEXT,
ADD COLUMN     "clientProfileId" TEXT,
ALTER COLUMN "role" SET DEFAULT 'client';

-- DropTable
DROP TABLE "AdminUser";

-- DropTable
DROP TABLE "Therapist";

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "medicalHistory" JSONB,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "professionalLicenseType" TEXT NOT NULL,
    "prcLicenseNumber" TEXT,
    "licensedSince" TIMESTAMP(3),
    "licenseExpiration" TIMESTAMP(3),
    "yearsOfExperience" INTEGER,
    "areasOfExpertise" JSONB NOT NULL,
    "therapeuticApproaches" JSONB NOT NULL,
    "languages" JSONB NOT NULL,
    "illnessSpecializations" JSONB NOT NULL,
    "expertiseLevels" JSONB NOT NULL,
    "weeklyAvailability" TEXT,
    "sessionLength" TEXT,
    "accepts" JSONB,
    "hourlyRate" DECIMAL(10,2),
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "treatmentSuccessRates" JSONB,
    "patientSatisfaction" DECIMAL(3,2),
    "totalPatients" INTEGER NOT NULL DEFAULT 0,
    "applicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeratorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissions" TEXT[],
    "assignedCommunities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModeratorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissions" TEXT[],
    "adminLevel" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE INDEX "ClientProfile_userId_idx" ON "ClientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistProfile_userId_key" ON "TherapistProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistProfile_applicationId_key" ON "TherapistProfile"("applicationId");

-- CreateIndex
CREATE INDEX "TherapistProfile_userId_idx" ON "TherapistProfile"("userId");

-- CreateIndex
CREATE INDEX "TherapistProfile_isActive_idx" ON "TherapistProfile"("isActive");

-- CreateIndex
CREATE INDEX "TherapistProfile_isVerified_idx" ON "TherapistProfile"("isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "ModeratorProfile_userId_key" ON "ModeratorProfile"("userId");

-- CreateIndex
CREATE INDEX "ModeratorProfile_userId_idx" ON "ModeratorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "AdminProfile"("userId");

-- CreateIndex
CREATE INDEX "AdminProfile_userId_idx" ON "AdminProfile"("userId");

-- CreateIndex
CREATE INDEX "User_assignedTherapistId_idx" ON "User"("assignedTherapistId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assignedTherapistId_fkey" FOREIGN KEY ("assignedTherapistId") REFERENCES "TherapistProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistProfile" ADD CONSTRAINT "TherapistProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistProfile" ADD CONSTRAINT "TherapistProfile_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "TherapistApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorProfile" ADD CONSTRAINT "ModeratorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worksheet" ADD CONSTRAINT "Worksheet_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
