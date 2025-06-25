/*
  Warnings:

  - You are about to drop the column `heartCount` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `illness` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `isPrivate` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `memberCount` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `postCount` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `heartCount` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `answerMatrix` on the `PreAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `answers` on the `PreAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `clerkId` on the `PreAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `PreAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `questionnaires` on the `PreAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `scores` on the `PreAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `severityLevels` on the `PreAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PreAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TherapistFileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `docType` on the `TherapistFileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `TherapistFileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `therapistApplicationId` on the `TherapistFileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TherapistFileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedBy` on the `TherapistFileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `clientProfileId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `assignedDate` on the `Worksheet` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Worksheet` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `Worksheet` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `Worksheet` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `Worksheet` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Worksheet` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `Worksheet` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Worksheet` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `WorksheetMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `WorksheetMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `WorksheetMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `WorksheetMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `WorksheetMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `WorksheetSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `WorksheetSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `WorksheetSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `WorksheetSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `WorksheetSubmission` table. All the data in the column will be lost.
  - You are about to drop the `AdminProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModeratorProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistApplication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistApplicationAccepts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistApplicationApproach` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistApplicationAssessmentTool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistApplicationDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistApplicationExpertise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistApplicationLanguage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapistProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserTherapist` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Community` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,communityId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[moderatorId,communityId]` on the table `ModeratorCommunity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clientId]` on the table `PreAssessment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `PreAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `therapistId` to the `TherapistFileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Worksheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `WorksheetSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `WorksheetSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AdminProfile" DROP CONSTRAINT "AdminProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "ClientMedicalHistory" DROP CONSTRAINT "ClientMedicalHistory_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ClientPreference" DROP CONSTRAINT "ClientPreference_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ClientProfile" DROP CONSTRAINT "ClientProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "CommentHeart" DROP CONSTRAINT "CommentHeart_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CommentHeart" DROP CONSTRAINT "CommentHeart_userId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "ModeratorCommunity" DROP CONSTRAINT "ModeratorCommunity_communityId_fkey";

-- DropForeignKey
ALTER TABLE "ModeratorCommunity" DROP CONSTRAINT "ModeratorCommunity_moderatorId_fkey";

-- DropForeignKey
ALTER TABLE "ModeratorProfile" DROP CONSTRAINT "ModeratorProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- DropForeignKey
ALTER TABLE "PostHeart" DROP CONSTRAINT "PostHeart_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostHeart" DROP CONSTRAINT "PostHeart_userId_fkey";

-- DropForeignKey
ALTER TABLE "PreAssessment" DROP CONSTRAINT "PreAssessment_userId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistAccepts" DROP CONSTRAINT "TherapistAccepts_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistApplicationAccepts" DROP CONSTRAINT "TherapistApplicationAccepts_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistApplicationApproach" DROP CONSTRAINT "TherapistApplicationApproach_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistApplicationAssessmentTool" DROP CONSTRAINT "TherapistApplicationAssessmentTool_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistApplicationDocument" DROP CONSTRAINT "TherapistApplicationDocument_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistApplicationExpertise" DROP CONSTRAINT "TherapistApplicationExpertise_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistApplicationLanguage" DROP CONSTRAINT "TherapistApplicationLanguage_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistApproach" DROP CONSTRAINT "TherapistApproach_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistAvailability" DROP CONSTRAINT "TherapistAvailability_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistExpertise" DROP CONSTRAINT "TherapistExpertise_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistIllnessSpecialization" DROP CONSTRAINT "TherapistIllnessSpecialization_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistLanguage" DROP CONSTRAINT "TherapistLanguage_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistProfile" DROP CONSTRAINT "TherapistProfile_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistProfile" DROP CONSTRAINT "TherapistProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "TherapistTreatmentSuccess" DROP CONSTRAINT "TherapistTreatmentSuccess_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "UserTherapist" DROP CONSTRAINT "UserTherapist_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "UserTherapist" DROP CONSTRAINT "UserTherapist_userId_fkey";

-- DropForeignKey
ALTER TABLE "Worksheet" DROP CONSTRAINT "Worksheet_therapistId_fkey";

-- DropForeignKey
ALTER TABLE "Worksheet" DROP CONSTRAINT "Worksheet_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorksheetMaterial" DROP CONSTRAINT "WorksheetMaterial_worksheetId_fkey";

-- DropForeignKey
ALTER TABLE "WorksheetSubmission" DROP CONSTRAINT "WorksheetSubmission_worksheetId_fkey";

-- DropIndex
DROP INDEX "Community_illness_idx";

-- DropIndex
DROP INDEX "Community_isActive_idx";

-- DropIndex
DROP INDEX "Community_slug_idx";

-- DropIndex
DROP INDEX "Community_slug_key";

-- DropIndex
DROP INDEX "PreAssessment_clerkId_idx";

-- DropIndex
DROP INDEX "PreAssessment_clerkId_key";

-- DropIndex
DROP INDEX "PreAssessment_userId_idx";

-- DropIndex
DROP INDEX "PreAssessment_userId_key";

-- DropIndex
DROP INDEX "TherapistFileUpload_docType_idx";

-- DropIndex
DROP INDEX "TherapistFileUpload_uploadedBy_idx";

-- DropIndex
DROP INDEX "Worksheet_status_idx";

-- DropIndex
DROP INDEX "Worksheet_userId_idx";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "heartCount",
DROP COLUMN "parentId",
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CommentFile" ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "CommentHeart" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Community" DROP COLUMN "illness",
DROP COLUMN "isActive",
DROP COLUMN "isPrivate",
DROP COLUMN "memberCount",
DROP COLUMN "postCount",
DROP COLUMN "slug",
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Membership" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'member';

-- AlterTable
ALTER TABLE "ModeratorCommunity" ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "heartCount",
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PostFile" ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "PostHeart" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PreAssessment" DROP COLUMN "answerMatrix",
DROP COLUMN "answers",
DROP COLUMN "clerkId",
DROP COLUMN "completedAt",
DROP COLUMN "questionnaires",
DROP COLUMN "scores",
DROP COLUMN "severityLevels",
DROP COLUMN "userId",
ADD COLUMN     "clientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TherapistFileUpload" DROP COLUMN "createdAt",
DROP COLUMN "docType",
DROP COLUMN "fileSize",
DROP COLUMN "therapistApplicationId",
DROP COLUMN "updatedAt",
DROP COLUMN "uploadedBy",
ADD COLUMN     "therapistId" TEXT NOT NULL,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "fileType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clientProfileId";

-- AlterTable
ALTER TABLE "Worksheet" DROP COLUMN "assignedDate",
DROP COLUMN "dueDate",
DROP COLUMN "feedback",
DROP COLUMN "instructions",
DROP COLUMN "isCompleted",
DROP COLUMN "status",
DROP COLUMN "submittedAt",
DROP COLUMN "userId",
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ALTER COLUMN "therapistId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorksheetMaterial" DROP COLUMN "createdAt",
DROP COLUMN "fileSize",
DROP COLUMN "fileType",
DROP COLUMN "filename",
DROP COLUMN "updatedAt",
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "WorksheetSubmission" DROP COLUMN "fileSize",
DROP COLUMN "fileType",
DROP COLUMN "filename",
DROP COLUMN "updatedAt",
DROP COLUMN "url",
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "content" TEXT NOT NULL;

-- DropTable
DROP TABLE "AdminProfile";

-- DropTable
DROP TABLE "ClientProfile";

-- DropTable
DROP TABLE "ModeratorProfile";

-- DropTable
DROP TABLE "TherapistApplication";

-- DropTable
DROP TABLE "TherapistApplicationAccepts";

-- DropTable
DROP TABLE "TherapistApplicationApproach";

-- DropTable
DROP TABLE "TherapistApplicationAssessmentTool";

-- DropTable
DROP TABLE "TherapistApplicationDocument";

-- DropTable
DROP TABLE "TherapistApplicationExpertise";

-- DropTable
DROP TABLE "TherapistApplicationLanguage";

-- DropTable
DROP TABLE "TherapistProfile";

-- DropTable
DROP TABLE "UserTherapist";

-- CreateTable
CREATE TABLE "Therapist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingDate" TIMESTAMP(3),
    "processedBy" TEXT,
    "applicationData" JSONB,
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
    "sessionLength" TEXT,
    "hourlyRate" DECIMAL(10,2),
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "treatmentSuccessRates" JSONB,
    "patientSatisfaction" DECIMAL(3,2),
    "totalPatients" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Therapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientTherapist" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,

    CONSTRAINT "ClientTherapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moderator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissions" TEXT[],
    "assignedCommunities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Moderator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissions" TEXT[],
    "adminLevel" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_userId_key" ON "Therapist"("userId");

-- CreateIndex
CREATE INDEX "Therapist_userId_idx" ON "Therapist"("userId");

-- CreateIndex
CREATE INDEX "Therapist_isActive_idx" ON "Therapist"("isActive");

-- CreateIndex
CREATE INDEX "Therapist_approved_idx" ON "Therapist"("approved");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "ClientTherapist_clientId_idx" ON "ClientTherapist"("clientId");

-- CreateIndex
CREATE INDEX "ClientTherapist_therapistId_idx" ON "ClientTherapist"("therapistId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientTherapist_clientId_therapistId_key" ON "ClientTherapist"("clientId", "therapistId");

-- CreateIndex
CREATE UNIQUE INDEX "Moderator_userId_key" ON "Moderator"("userId");

-- CreateIndex
CREATE INDEX "Moderator_userId_idx" ON "Moderator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "Admin_userId_idx" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "CommentFile_commentId_idx" ON "CommentFile"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_key" ON "Community"("name");

-- CreateIndex
CREATE INDEX "Community_name_idx" ON "Community"("name");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_communityId_idx" ON "Membership"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_communityId_key" ON "Membership"("userId", "communityId");

-- CreateIndex
CREATE UNIQUE INDEX "ModeratorCommunity_moderatorId_communityId_key" ON "ModeratorCommunity"("moderatorId", "communityId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_communityId_idx" ON "Post"("communityId");

-- CreateIndex
CREATE INDEX "PostFile_postId_idx" ON "PostFile"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PreAssessment_clientId_key" ON "PreAssessment"("clientId");

-- CreateIndex
CREATE INDEX "PreAssessment_clientId_idx" ON "PreAssessment"("clientId");

-- CreateIndex
CREATE INDEX "TherapistFileUpload_therapistId_idx" ON "TherapistFileUpload"("therapistId");

-- CreateIndex
CREATE INDEX "Worksheet_clientId_idx" ON "Worksheet"("clientId");

-- CreateIndex
CREATE INDEX "WorksheetSubmission_clientId_idx" ON "WorksheetSubmission"("clientId");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistAvailability" ADD CONSTRAINT "TherapistAvailability_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHeart" ADD CONSTRAINT "PostHeart_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHeart" ADD CONSTRAINT "PostHeart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentHeart" ADD CONSTRAINT "CommentHeart_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentHeart" ADD CONSTRAINT "CommentHeart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAssessment" ADD CONSTRAINT "PreAssessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistExpertise" ADD CONSTRAINT "TherapistExpertise_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistApproach" ADD CONSTRAINT "TherapistApproach_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistLanguage" ADD CONSTRAINT "TherapistLanguage_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistIllnessSpecialization" ADD CONSTRAINT "TherapistIllnessSpecialization_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistAccepts" ADD CONSTRAINT "TherapistAccepts_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistTreatmentSuccess" ADD CONSTRAINT "TherapistTreatmentSuccess_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistFileUpload" ADD CONSTRAINT "TherapistFileUpload_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTherapist" ADD CONSTRAINT "ClientTherapist_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTherapist" ADD CONSTRAINT "ClientTherapist_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderator" ADD CONSTRAINT "Moderator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMedicalHistory" ADD CONSTRAINT "ClientMedicalHistory_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPreference" ADD CONSTRAINT "ClientPreference_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorCommunity" ADD CONSTRAINT "ModeratorCommunity_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorCommunity" ADD CONSTRAINT "ModeratorCommunity_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worksheet" ADD CONSTRAINT "Worksheet_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worksheet" ADD CONSTRAINT "Worksheet_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetMaterial" ADD CONSTRAINT "WorksheetMaterial_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "Worksheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetSubmission" ADD CONSTRAINT "WorksheetSubmission_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "Worksheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetSubmission" ADD CONSTRAINT "WorksheetSubmission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
