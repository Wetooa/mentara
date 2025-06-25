/*
  Warnings:

  - You are about to drop the column `assignedTherapistId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_assignedTherapistId_fkey";

-- DropIndex
DROP INDEX "User_assignedTherapistId_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "assignedTherapistId";

-- CreateTable
CREATE TABLE "UserTherapist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTherapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistExpertise" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "expertise" TEXT NOT NULL,
    "level" INTEGER,

    CONSTRAINT "TherapistExpertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistApproach" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "approach" TEXT NOT NULL,

    CONSTRAINT "TherapistApproach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistLanguage" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "TherapistLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistIllnessSpecialization" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "illness" TEXT NOT NULL,
    "level" INTEGER,

    CONSTRAINT "TherapistIllnessSpecialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistAccepts" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "acceptType" TEXT NOT NULL,

    CONSTRAINT "TherapistAccepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistTreatmentSuccess" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "illness" TEXT NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TherapistTreatmentSuccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientMedicalHistory" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ClientMedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPreference" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ClientPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeratorCommunity" (
    "id" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "ModeratorCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistApplicationExpertise" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "expertise" TEXT NOT NULL,

    CONSTRAINT "TherapistApplicationExpertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistApplicationAssessmentTool" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "tool" TEXT NOT NULL,

    CONSTRAINT "TherapistApplicationAssessmentTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistApplicationApproach" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "approach" TEXT NOT NULL,

    CONSTRAINT "TherapistApplicationApproach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistApplicationLanguage" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "TherapistApplicationLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistApplicationAccepts" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "acceptType" TEXT NOT NULL,

    CONSTRAINT "TherapistApplicationAccepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistApplicationDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,

    CONSTRAINT "TherapistApplicationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreAssessmentQuestionnaire" (
    "id" TEXT NOT NULL,
    "preAssessmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PreAssessmentQuestionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreAssessmentAnswer" (
    "id" TEXT NOT NULL,
    "preAssessmentId" TEXT NOT NULL,
    "questionnaire" TEXT NOT NULL,
    "answerIndex" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PreAssessmentAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreAssessmentAnswerMatrix" (
    "id" TEXT NOT NULL,
    "preAssessmentId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PreAssessmentAnswerMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreAssessmentScore" (
    "id" TEXT NOT NULL,
    "preAssessmentId" TEXT NOT NULL,
    "questionnaire" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PreAssessmentScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreAssessmentSeverityLevel" (
    "id" TEXT NOT NULL,
    "preAssessmentId" TEXT NOT NULL,
    "questionnaire" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "PreAssessmentSeverityLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "meetingType" TEXT NOT NULL DEFAULT 'video',
    "meetingUrl" TEXT,
    "notes" TEXT,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "durationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistAvailability" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingDuration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingDuration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTherapist_userId_idx" ON "UserTherapist"("userId");

-- CreateIndex
CREATE INDEX "UserTherapist_therapistId_idx" ON "UserTherapist"("therapistId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTherapist_userId_therapistId_key" ON "UserTherapist"("userId", "therapistId");

-- CreateIndex
CREATE INDEX "TherapistExpertise_therapistId_idx" ON "TherapistExpertise"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistApproach_therapistId_idx" ON "TherapistApproach"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistLanguage_therapistId_idx" ON "TherapistLanguage"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistIllnessSpecialization_therapistId_idx" ON "TherapistIllnessSpecialization"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistAccepts_therapistId_idx" ON "TherapistAccepts"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistTreatmentSuccess_therapistId_idx" ON "TherapistTreatmentSuccess"("therapistId");

-- CreateIndex
CREATE INDEX "ClientMedicalHistory_clientId_idx" ON "ClientMedicalHistory"("clientId");

-- CreateIndex
CREATE INDEX "ClientPreference_clientId_idx" ON "ClientPreference"("clientId");

-- CreateIndex
CREATE INDEX "ModeratorCommunity_moderatorId_idx" ON "ModeratorCommunity"("moderatorId");

-- CreateIndex
CREATE INDEX "ModeratorCommunity_communityId_idx" ON "ModeratorCommunity"("communityId");

-- CreateIndex
CREATE INDEX "TherapistApplicationExpertise_applicationId_idx" ON "TherapistApplicationExpertise"("applicationId");

-- CreateIndex
CREATE INDEX "TherapistApplicationAssessmentTool_applicationId_idx" ON "TherapistApplicationAssessmentTool"("applicationId");

-- CreateIndex
CREATE INDEX "TherapistApplicationApproach_applicationId_idx" ON "TherapistApplicationApproach"("applicationId");

-- CreateIndex
CREATE INDEX "TherapistApplicationLanguage_applicationId_idx" ON "TherapistApplicationLanguage"("applicationId");

-- CreateIndex
CREATE INDEX "TherapistApplicationAccepts_applicationId_idx" ON "TherapistApplicationAccepts"("applicationId");

-- CreateIndex
CREATE INDEX "TherapistApplicationDocument_applicationId_idx" ON "TherapistApplicationDocument"("applicationId");

-- CreateIndex
CREATE INDEX "PreAssessmentQuestionnaire_preAssessmentId_idx" ON "PreAssessmentQuestionnaire"("preAssessmentId");

-- CreateIndex
CREATE INDEX "PreAssessmentAnswer_preAssessmentId_idx" ON "PreAssessmentAnswer"("preAssessmentId");

-- CreateIndex
CREATE INDEX "PreAssessmentAnswerMatrix_preAssessmentId_idx" ON "PreAssessmentAnswerMatrix"("preAssessmentId");

-- CreateIndex
CREATE INDEX "PreAssessmentScore_preAssessmentId_idx" ON "PreAssessmentScore"("preAssessmentId");

-- CreateIndex
CREATE INDEX "PreAssessmentSeverityLevel_preAssessmentId_idx" ON "PreAssessmentSeverityLevel"("preAssessmentId");

-- CreateIndex
CREATE INDEX "Meeting_clientId_idx" ON "Meeting"("clientId");

-- CreateIndex
CREATE INDEX "Meeting_therapistId_idx" ON "Meeting"("therapistId");

-- CreateIndex
CREATE INDEX "Meeting_startTime_idx" ON "Meeting"("startTime");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

-- CreateIndex
CREATE INDEX "Meeting_therapistId_startTime_idx" ON "Meeting"("therapistId", "startTime");

-- CreateIndex
CREATE INDEX "TherapistAvailability_therapistId_idx" ON "TherapistAvailability"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistAvailability_dayOfWeek_idx" ON "TherapistAvailability"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistAvailability_therapistId_dayOfWeek_startTime_endTi_key" ON "TherapistAvailability"("therapistId", "dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "MeetingDuration_isActive_idx" ON "MeetingDuration"("isActive");

-- CreateIndex
CREATE INDEX "MeetingDuration_sortOrder_idx" ON "MeetingDuration"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingDuration_duration_key" ON "MeetingDuration"("duration");

-- AddForeignKey
ALTER TABLE "UserTherapist" ADD CONSTRAINT "UserTherapist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTherapist" ADD CONSTRAINT "UserTherapist_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistExpertise" ADD CONSTRAINT "TherapistExpertise_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistApproach" ADD CONSTRAINT "TherapistApproach_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistLanguage" ADD CONSTRAINT "TherapistLanguage_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistIllnessSpecialization" ADD CONSTRAINT "TherapistIllnessSpecialization_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistAccepts" ADD CONSTRAINT "TherapistAccepts_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistTreatmentSuccess" ADD CONSTRAINT "TherapistTreatmentSuccess_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMedicalHistory" ADD CONSTRAINT "ClientMedicalHistory_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPreference" ADD CONSTRAINT "ClientPreference_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorCommunity" ADD CONSTRAINT "ModeratorCommunity_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "ModeratorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorCommunity" ADD CONSTRAINT "ModeratorCommunity_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistApplicationExpertise" ADD CONSTRAINT "TherapistApplicationExpertise_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "TherapistApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistApplicationAssessmentTool" ADD CONSTRAINT "TherapistApplicationAssessmentTool_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "TherapistApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistApplicationApproach" ADD CONSTRAINT "TherapistApplicationApproach_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "TherapistApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistApplicationLanguage" ADD CONSTRAINT "TherapistApplicationLanguage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "TherapistApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistApplicationAccepts" ADD CONSTRAINT "TherapistApplicationAccepts_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "TherapistApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistApplicationDocument" ADD CONSTRAINT "TherapistApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "TherapistApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAssessmentQuestionnaire" ADD CONSTRAINT "PreAssessmentQuestionnaire_preAssessmentId_fkey" FOREIGN KEY ("preAssessmentId") REFERENCES "PreAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAssessmentAnswer" ADD CONSTRAINT "PreAssessmentAnswer_preAssessmentId_fkey" FOREIGN KEY ("preAssessmentId") REFERENCES "PreAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAssessmentAnswerMatrix" ADD CONSTRAINT "PreAssessmentAnswerMatrix_preAssessmentId_fkey" FOREIGN KEY ("preAssessmentId") REFERENCES "PreAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAssessmentScore" ADD CONSTRAINT "PreAssessmentScore_preAssessmentId_fkey" FOREIGN KEY ("preAssessmentId") REFERENCES "PreAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAssessmentSeverityLevel" ADD CONSTRAINT "PreAssessmentSeverityLevel_preAssessmentId_fkey" FOREIGN KEY ("preAssessmentId") REFERENCES "PreAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_durationId_fkey" FOREIGN KEY ("durationId") REFERENCES "MeetingDuration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistAvailability" ADD CONSTRAINT "TherapistAvailability_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
