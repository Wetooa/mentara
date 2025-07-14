/*
  Warnings:

  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Admin` table. All the data in the column will be lost.
  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Client` table. All the data in the column will be lost.
  - The primary key for the `Moderator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Moderator` table. All the data in the column will be lost.
  - The primary key for the `Therapist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `yearsOfExperience` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `clerkId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `PreAssessmentAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PreAssessmentAnswerMatrix` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PreAssessmentQuestionnaire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PreAssessmentScore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PreAssessmentSeverityLevel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistAccepts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistApproach` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistExpertise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistFileUpload` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistIllnessSpecialization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistLanguage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistTreatmentSuccess` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Community` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Community` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answerMatrix` to the `PreAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answers` to the `PreAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionnaires` to the `PreAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scores` to the `PreAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severityLevels` to the `PreAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `practiceStartDate` to the `Therapist` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- DropForeignKey
ALTER TABLE "ClientMedicalHistory" DROP CONSTRAINT "ClientMedicalHistory_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ClientPreference" DROP CONSTRAINT "ClientPreference_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ClientTherapist" DROP CONSTRAINT "ClientTherapist_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ClientTherapist" DROP CONSTRAINT "ClientTherapist_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "ModeratorCommunity" DROP CONSTRAINT "ModeratorCommunity_moderatorId_fkey";

-- DropForeignKey
ALTER TABLE "PreAssessment" DROP CONSTRAINT "PreAssessment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "PreAssessmentAnswer" DROP CONSTRAINT "PreAssessmentAnswer_preAssessmentId_fkey";

-- DropForeignKey
ALTER TABLE "PreAssessmentAnswerMatrix" DROP CONSTRAINT "PreAssessmentAnswerMatrix_preAssessmentId_fkey";

-- DropForeignKey
ALTER TABLE "PreAssessmentQuestionnaire" DROP CONSTRAINT "PreAssessmentQuestionnaire_preAssessmentId_fkey";

-- DropForeignKey
ALTER TABLE "PreAssessmentScore" DROP CONSTRAINT "PreAssessmentScore_preAssessmentId_fkey";

-- DropForeignKey
ALTER TABLE "PreAssessmentSeverityLevel" DROP CONSTRAINT "PreAssessmentSeverityLevel_preAssessmentId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistAccepts" DROP CONSTRAINT "TherapistAccepts_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistApproach" DROP CONSTRAINT "TherapistApproach_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistAvailability" DROP CONSTRAINT "TherapistAvailability_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistExpertise" DROP CONSTRAINT "TherapistExpertise_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistFileUpload" DROP CONSTRAINT "TherapistFileUpload_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistIllnessSpecialization" DROP CONSTRAINT "TherapistIllnessSpecialization_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistLanguage" DROP CONSTRAINT "TherapistLanguage_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistTreatmentSuccess" DROP CONSTRAINT "TherapistTreatmentSuccess_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "Worksheet" DROP CONSTRAINT "Worksheet_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Worksheet" DROP CONSTRAINT "Worksheet_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "WorksheetSubmission" DROP CONSTRAINT "WorksheetSubmission_clientId_fkey";

-- DropIndex
DROP INDEX "User_clerkId_idx";

-- DropIndex
DROP INDEX "User_clerkId_key";

-- AlterTable
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "Client" DROP CONSTRAINT "Client_pkey",
DROP COLUMN "id",
ADD COLUMN     "hasSeenTherapistRecommendations" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Moderator" DROP CONSTRAINT "Moderator_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "PreAssessment" ADD COLUMN     "answerMatrix" JSONB NOT NULL,
ADD COLUMN     "answers" JSONB NOT NULL,
ADD COLUMN     "questionnaires" JSONB NOT NULL,
ADD COLUMN     "scores" JSONB NOT NULL,
ADD COLUMN     "severityLevels" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Therapist" DROP CONSTRAINT "Therapist_pkey",
DROP COLUMN "id",
DROP COLUMN "yearsOfExperience",
ADD COLUMN     "acceptTypes" JSONB,
ADD COLUMN     "approaches" JSONB,
ADD COLUMN     "expertise" JSONB,
ADD COLUMN     "illnessSpecializations" JSONB,
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "practiceStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uploadedFiles" JSONB,
ADD CONSTRAINT "Therapist_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clerkId";

-- DropTable
DROP TABLE "PreAssessmentAnswer";

-- DropTable
DROP TABLE "PreAssessmentAnswerMatrix";

-- DropTable
DROP TABLE "PreAssessmentQuestionnaire";

-- DropTable
DROP TABLE "PreAssessmentScore";

-- DropTable
DROP TABLE "PreAssessmentSeverityLevel";

-- DropTable
DROP TABLE "TherapistAccepts";

-- DropTable
DROP TABLE "TherapistApproach";

-- DropTable
DROP TABLE "TherapistExpertise";

-- DropTable
DROP TABLE "TherapistFileUpload";

-- DropTable
DROP TABLE "TherapistIllnessSpecialization";

-- DropTable
DROP TABLE "TherapistLanguage";

-- DropTable
DROP TABLE "TherapistTreatmentSuccess";

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "meetingId" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "moderationNote" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewHelpful" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewHelpful_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_therapistId_idx" ON "Review"("therapistId");

-- CreateIndex
CREATE INDEX "Review_clientId_idx" ON "Review"("clientId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_clientId_therapistId_meetingId_key" ON "Review"("clientId", "therapistId", "meetingId");

-- CreateIndex
CREATE INDEX "ReviewHelpful_reviewId_idx" ON "ReviewHelpful"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewHelpful_userId_idx" ON "ReviewHelpful"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewHelpful_reviewId_userId_key" ON "ReviewHelpful"("reviewId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");

-- CreateIndex
CREATE INDEX "Community_slug_idx" ON "Community"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistAvailability" ADD CONSTRAINT "TherapistAvailability_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAssessment" ADD CONSTRAINT "PreAssessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewHelpful" ADD CONSTRAINT "ReviewHelpful_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewHelpful" ADD CONSTRAINT "ReviewHelpful_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTherapist" ADD CONSTRAINT "ClientTherapist_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTherapist" ADD CONSTRAINT "ClientTherapist_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMedicalHistory" ADD CONSTRAINT "ClientMedicalHistory_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPreference" ADD CONSTRAINT "ClientPreference_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorCommunity" ADD CONSTRAINT "ModeratorCommunity_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderator"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worksheet" ADD CONSTRAINT "Worksheet_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worksheet" ADD CONSTRAINT "Worksheet_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetSubmission" ADD CONSTRAINT "WorksheetSubmission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
