-- CreateTable
CREATE TABLE "TherapistApplication" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingDate" TIMESTAMP(3),
    "processedBy" TEXT,
    "applicationData" JSONB NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "professionalLicenseType" TEXT NOT NULL,
    "isPRCLicensed" TEXT NOT NULL,
    "prcLicenseNumber" TEXT NOT NULL,
    "expirationDateOfLicense" TIMESTAMP(3),
    "isLicenseActive" TEXT NOT NULL,
    "yearsOfExperience" TEXT NOT NULL,
    "areasOfExpertise" JSONB NOT NULL,
    "assessmentTools" JSONB NOT NULL,
    "therapeuticApproachesUsedList" JSONB NOT NULL,
    "languagesOffered" JSONB NOT NULL,
    "providedOnlineTherapyBefore" TEXT NOT NULL,
    "comfortableUsingVideoConferencing" TEXT NOT NULL,
    "weeklyAvailability" TEXT NOT NULL,
    "preferredSessionLength" TEXT NOT NULL,
    "accepts" JSONB NOT NULL,
    "privateConfidentialSpace" TEXT NOT NULL,
    "compliesWithDataPrivacyAct" TEXT NOT NULL,
    "professionalLiabilityInsurance" TEXT NOT NULL,
    "complaintsOrDisciplinaryActions" TEXT NOT NULL,
    "willingToAbideByPlatformGuidelines" TEXT NOT NULL,
    "uploadedDocuments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Therapist" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
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
    "weeklyAvailability" TEXT,
    "sessionLength" TEXT,
    "accepts" JSONB,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "applicationId" TEXT,
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "hourlyRate" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Therapist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TherapistApplication_clerkUserId_key" ON "TherapistApplication"("clerkUserId");

-- CreateIndex
CREATE INDEX "TherapistApplication_status_idx" ON "TherapistApplication"("status");

-- CreateIndex
CREATE INDEX "TherapistApplication_email_idx" ON "TherapistApplication"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_clerkUserId_key" ON "Therapist"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_email_key" ON "Therapist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_applicationId_key" ON "Therapist"("applicationId");

-- CreateIndex
CREATE INDEX "Therapist_clerkUserId_idx" ON "Therapist"("clerkUserId");

-- AddForeignKey
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "TherapistApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
