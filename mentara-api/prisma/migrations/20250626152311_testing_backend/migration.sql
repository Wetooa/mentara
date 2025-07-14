/*
  Warnings:

  - You are about to drop the column `heartCount` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `illness` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `isPrivate` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `memberCount` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `postCount` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `durationId` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `communityId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `heartCount` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `helpfulCount` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `accepts` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `applicationData` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `isLicenseActive` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `patientSatisfaction` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `processedBy` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `profileComplete` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageUrl` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `totalPatients` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedFiles` on the `Therapist` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyAvailability` on the `Therapist` table. All the data in the column will be lost.
  - The `areasOfExpertise` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `assessmentTools` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `therapeuticApproachesUsedList` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `languagesOffered` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `preferredSessionLength` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `acceptTypes` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `approaches` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `expertise` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `illnessSpecializations` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `languages` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `yearsOfExperience` column on the `Therapist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CommentFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MeetingDuration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostFile` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `description` on table `Community` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageUrl` on table `Community` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `aiEstimate` to the `PreAssessment` table without a default value. This is not possible if the table is not empty.
  - Made the column `processingDate` on table `Therapist` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expirationDateOfLicense` on table `Therapist` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `providedOnlineTherapyBefore` on the `Therapist` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `comfortableUsingVideoConferencing` on the `Therapist` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `sessionLength` on table `Therapist` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hourlyRate` on table `Therapist` required. This step will fail if there are existing NULL values in that column.
  - Made the column `treatmentSuccessRates` on table `Therapist` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `compliesWithDataPrivacyAct` to the `Therapist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `willingToAbideByPlatformGuidelines` to the `Therapist` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuestionnaireCategory" AS ENUM ('DEPRESSION', 'ANXIETY', 'STRESS', 'TRAUMA_PTSD', 'SUBSTANCE_USE', 'EATING_DISORDERS', 'SLEEP_DISORDERS', 'ADHD', 'BIPOLAR', 'PERSONALITY', 'SOCIAL_ANXIETY', 'PANIC_DISORDER', 'OCD', 'GENERAL_WELLBEING');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT_SHORT', 'TEXT_LONG', 'NUMERIC', 'SCALE', 'DATE', 'BOOLEAN', 'SLIDER', 'RANKING');

-- CreateEnum
CREATE TYPE "ScoringType" AS ENUM ('SUM', 'AVERAGE', 'WEIGHTED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "QuestionnaireStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('MINIMAL', 'MILD', 'MODERATE', 'MODERATELY_SEVERE', 'SEVERE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('NONE', 'MINIMAL', 'MILD', 'MODERATE', 'SEVERE', 'EXTREME');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('MOOD_RATING', 'ANXIETY_LEVEL', 'SLEEP_QUALITY', 'ENERGY_LEVEL', 'SOCIAL_FUNCTIONING', 'WORK_PERFORMANCE', 'APPETITE', 'CONCENTRATION', 'MEDICATION_ADHERENCE', 'EXERCISE_FREQUENCY', 'SUBSTANCE_USE', 'SELF_HARM_THOUGHTS', 'SUICIDAL_IDEATION');

-- CreateEnum
CREATE TYPE "IndicatorSource" AS ENUM ('SELF_REPORT', 'THERAPIST_ASSESSMENT', 'AUTOMATED_TRACKING', 'FAMILY_REPORT', 'MEDICAL_RECORD', 'WEARABLE_DEVICE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'USER_UPDATE_PROFILE', 'USER_DELETE_ACCOUNT', 'USER_CHANGE_PASSWORD', 'USER_RESET_PASSWORD', 'THERAPIST_APPLICATION_SUBMIT', 'THERAPIST_APPLICATION_APPROVE', 'THERAPIST_APPLICATION_REJECT', 'THERAPIST_PROFILE_UPDATE', 'THERAPIST_AVAILABILITY_UPDATE', 'MEETING_CREATE', 'MEETING_UPDATE', 'MEETING_CANCEL', 'MEETING_COMPLETE', 'MEETING_NO_SHOW', 'WORKSHEET_CREATE', 'WORKSHEET_ASSIGN', 'WORKSHEET_SUBMIT', 'WORKSHEET_GRADE', 'REVIEW_CREATE', 'REVIEW_UPDATE', 'REVIEW_DELETE', 'REVIEW_MODERATE', 'MESSAGE_SEND', 'MESSAGE_EDIT', 'MESSAGE_DELETE', 'MESSAGE_REPORT', 'ADMIN_USER_SUSPEND', 'ADMIN_USER_ACTIVATE', 'ADMIN_CONTENT_MODERATE', 'ADMIN_SYSTEM_CONFIG', 'SYSTEM_BACKUP', 'SYSTEM_MAINTENANCE', 'SYSTEM_ERROR', 'DATA_EXPORT', 'DATA_PURGE');

-- CreateEnum
CREATE TYPE "SystemEventType" AS ENUM ('HIGH_CPU_USAGE', 'HIGH_MEMORY_USAGE', 'SLOW_QUERY', 'HIGH_ERROR_RATE', 'FAILED_LOGIN_ATTEMPTS', 'SUSPICIOUS_ACTIVITY', 'DATA_BREACH_ATTEMPT', 'UNAUTHORIZED_ACCESS', 'HIGH_USER_LOAD', 'PAYMENT_PROCESSING_ERROR', 'EMAIL_DELIVERY_FAILURE', 'THIRD_PARTY_API_ERROR', 'SERVICE_START', 'SERVICE_STOP', 'DEPLOYMENT', 'CONFIGURATION_CHANGE', 'DATABASE_MIGRATION', 'UNUSUAL_USER_BEHAVIOR', 'MASS_USER_ACTIONS', 'DATA_EXPORT_REQUEST');

-- CreateEnum
CREATE TYPE "EventSeverity" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DataClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAUSED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'CRYPTO');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL', 'SQUARE', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'UNCOLLECTIBLE', 'VOID');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL_EXTENSION');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'AWS_S3', 'SUPABASE', 'CLOUDINARY', 'GOOGLE_CLOUD');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('PRIVATE', 'INTERNAL', 'PUBLIC');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('UPLOADING', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED', 'QUARANTINED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'SCANNING', 'CLEAN', 'INFECTED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AttachmentEntityType" AS ENUM ('POST', 'COMMENT', 'REPLY', 'MESSAGE', 'WORKSHEET', 'SUBMISSION', 'REVIEW', 'PROFILE', 'THERAPIST_APPLICATION', 'MEETING_NOTES', 'PROGRESS_REPORT');

-- CreateEnum
CREATE TYPE "AttachmentPurpose" AS ENUM ('GENERAL', 'AVATAR', 'COVER', 'DOCUMENT', 'MEDIA', 'AUDIO', 'BACKUP', 'CERTIFICATE', 'LICENSE', 'TRANSCRIPT');

-- CreateEnum
CREATE TYPE "FileShareType" AS ENUM ('LINK', 'EMAIL', 'INTERNAL', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('INITIAL_CONSULTATION', 'REGULAR_THERAPY', 'CRISIS_INTERVENTION', 'GROUP_THERAPY', 'FAMILY_THERAPY', 'FOLLOW_UP', 'ASSESSMENT', 'SELF_GUIDED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'TECHNICAL_ISSUE', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('SESSION_START', 'SESSION_END', 'SCREEN_SHARE', 'FILE_SHARE', 'WHITEBOARD_USE', 'CHAT_MESSAGE', 'GOAL_SETTING', 'PROGRESS_REVIEW', 'HOMEWORK_ASSIGNMENT', 'ASSESSMENT_COMPLETION', 'MOOD_CHECK_IN', 'CONNECTION_ISSUE', 'AUDIO_PROBLEM', 'VIDEO_PROBLEM', 'RECONNECTION', 'RECORDING_START', 'RECORDING_STOP');

-- CreateEnum
CREATE TYPE "UserActionType" AS ENUM ('PAGE_VIEW', 'PAGE_EXIT', 'CLICK', 'SCROLL', 'SEARCH', 'POST_CREATE', 'POST_VIEW', 'POST_LIKE', 'COMMENT_CREATE', 'COMMENT_LIKE', 'THERAPIST_SEARCH', 'THERAPIST_PROFILE_VIEW', 'APPOINTMENT_BOOK', 'APPOINTMENT_CANCEL', 'MESSAGE_SEND', 'WORKSHEET_COMPLETE', 'PROFILE_UPDATE', 'SETTINGS_CHANGE', 'PASSWORD_CHANGE', 'LOGOUT');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "CommentFile" DROP CONSTRAINT "CommentFile_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_durationId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_communityId_fkey";

-- DropForeignKey
ALTER TABLE "PostFile" DROP CONSTRAINT "PostFile_postId_fkey";

-- DropIndex
DROP INDEX "Comment_parentId_idx";

-- DropIndex
DROP INDEX "Community_illness_idx";

-- DropIndex
DROP INDEX "Post_communityId_idx";

-- DropIndex
DROP INDEX "Therapist_approved_idx";

-- DropIndex
DROP INDEX "Therapist_isActive_idx";

-- AlterTable
ALTER TABLE "ClientTherapist" ADD COLUMN     "score" INTEGER;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "heartCount",
DROP COLUMN "parentId";

-- AlterTable
ALTER TABLE "Community" DROP COLUMN "illness",
DROP COLUMN "isActive",
DROP COLUMN "isPrivate",
DROP COLUMN "memberCount",
DROP COLUMN "postCount",
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "imageUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "durationId",
DROP COLUMN "endTime",
DROP COLUMN "notes",
ALTER COLUMN "duration" SET DEFAULT 60;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "communityId",
DROP COLUMN "heartCount",
ADD COLUMN     "roomId" TEXT;

-- AlterTable
ALTER TABLE "PreAssessment" ADD COLUMN     "aiEstimate" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "helpfulCount";

-- AlterTable
ALTER TABLE "Therapist" DROP COLUMN "accepts",
DROP COLUMN "applicationData",
DROP COLUMN "approved",
DROP COLUMN "bio",
DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "isActive",
DROP COLUMN "isLicenseActive",
DROP COLUMN "lastName",
DROP COLUMN "patientSatisfaction",
DROP COLUMN "processedBy",
DROP COLUMN "profileComplete",
DROP COLUMN "profileImageUrl",
DROP COLUMN "totalPatients",
DROP COLUMN "uploadedFiles",
DROP COLUMN "weeklyAvailability",
ADD COLUMN     "acceptedInsuranceTypes" TEXT[],
ADD COLUMN     "acceptsInsurance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "certifications" JSONB,
ADD COLUMN     "educationBackground" TEXT,
ADD COLUMN     "licenseVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licenseVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "licenseVerifiedBy" TEXT,
ADD COLUMN     "practiceLocation" TEXT,
ADD COLUMN     "processedByAdminId" TEXT,
ADD COLUMN     "specialCertifications" TEXT[],
ALTER COLUMN "processingDate" SET NOT NULL,
ALTER COLUMN "processingDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "expirationDateOfLicense" SET NOT NULL,
DROP COLUMN "areasOfExpertise",
ADD COLUMN     "areasOfExpertise" TEXT[],
DROP COLUMN "assessmentTools",
ADD COLUMN     "assessmentTools" TEXT[],
DROP COLUMN "therapeuticApproachesUsedList",
ADD COLUMN     "therapeuticApproachesUsedList" TEXT[],
DROP COLUMN "languagesOffered",
ADD COLUMN     "languagesOffered" TEXT[],
DROP COLUMN "providedOnlineTherapyBefore",
ADD COLUMN     "providedOnlineTherapyBefore" BOOLEAN NOT NULL,
DROP COLUMN "comfortableUsingVideoConferencing",
ADD COLUMN     "comfortableUsingVideoConferencing" BOOLEAN NOT NULL,
DROP COLUMN "preferredSessionLength",
ADD COLUMN     "preferredSessionLength" INTEGER[],
ALTER COLUMN "sessionLength" SET NOT NULL,
ALTER COLUMN "hourlyRate" SET NOT NULL,
ALTER COLUMN "treatmentSuccessRates" SET NOT NULL,
DROP COLUMN "acceptTypes",
ADD COLUMN     "acceptTypes" TEXT[],
DROP COLUMN "approaches",
ADD COLUMN     "approaches" TEXT[],
DROP COLUMN "expertise",
ADD COLUMN     "expertise" TEXT[],
DROP COLUMN "illnessSpecializations",
ADD COLUMN     "illnessSpecializations" TEXT[],
DROP COLUMN "languages",
ADD COLUMN     "languages" TEXT[],
DROP COLUMN "compliesWithDataPrivacyAct",
ADD COLUMN     "compliesWithDataPrivacyAct" BOOLEAN NOT NULL,
DROP COLUMN "willingToAbideByPlatformGuidelines",
ADD COLUMN     "willingToAbideByPlatformGuidelines" BOOLEAN NOT NULL,
DROP COLUMN "yearsOfExperience",
ADD COLUMN     "yearsOfExperience" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowMessagesFrom" TEXT NOT NULL DEFAULT 'therapists',
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileVisibility" TEXT NOT NULL DEFAULT 'private',
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedBy" TEXT,
ADD COLUMN     "suspensionReason" TEXT,
ADD COLUMN     "theme" TEXT DEFAULT 'light',
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC';

-- DropTable
DROP TABLE "CommentFile";

-- DropTable
DROP TABLE "MeetingDuration";

-- DropTable
DROP TABLE "PostFile";

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "overallRisk" "RiskLevel",
    "primaryConcerns" TEXT[],
    "recommendations" TEXT[],
    "confidenceScore" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questionnaire" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "category" "QuestionnaireCategory" NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "timeLimit" INTEGER,
    "scoringType" "ScoringType" NOT NULL DEFAULT 'SUM',
    "minScore" INTEGER,
    "maxScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "validation" JSONB,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "score" INTEGER,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentQuestionnaire" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "status" "QuestionnaireStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER,

    CONSTRAINT "AssessmentQuestionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "assessmentQuestionnaireId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "textResponse" TEXT,
    "numericResponse" DECIMAL(10,2),
    "dateResponse" TIMESTAMP(3),
    "booleanResponse" BOOLEAN,
    "multiSelectResponses" TEXT[],
    "responseTime" INTEGER,
    "wasSkipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentScore" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rawScore" DECIMAL(10,2) NOT NULL,
    "normalizedScore" DECIMAL(5,2) NOT NULL,
    "severityLevel" "SeverityLevel" NOT NULL,
    "calculatedBy" TEXT NOT NULL,
    "confidence" DECIMAL(5,2),
    "interpretation" TEXT,
    "recommendations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentalHealthIndicator" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "indicator" "IndicatorType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "unit" TEXT,
    "source" "IndicatorSource" NOT NULL,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentalHealthIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "userRole" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "description" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemEvent" (
    "id" TEXT NOT NULL,
    "eventType" "SystemEventType" NOT NULL,
    "severity" "EventSeverity" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "component" TEXT,
    "metadata" JSONB,
    "errorCode" TEXT,
    "stackTrace" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataChangeLog" (
    "id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "changedFields" JSONB,
    "oldData" JSONB,
    "newData" JSONB,
    "changedBy" TEXT,
    "reason" TEXT,
    "dataClass" "DataClassification" NOT NULL DEFAULT 'INTERNAL',
    "retentionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "tier" "SubscriptionTier" NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "defaultPaymentMethodId" TEXT,
    "metadata" JSONB,
    "cancelReason" TEXT,
    "canceledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tier" "SubscriptionTier" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "yearlyPrice" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "features" JSONB NOT NULL,
    "limits" JSONB NOT NULL,
    "trialDays" INTEGER,
    "stripeProductId" TEXT,
    "stripePriceIds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
    "cardLast4" TEXT,
    "cardBrand" TEXT,
    "cardExpMonth" INTEGER,
    "cardExpYear" INTEGER,
    "stripePaymentMethodId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethodId" TEXT,
    "subscriptionId" TEXT,
    "invoiceId" TEXT,
    "meetingId" TEXT,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
    "providerPaymentId" TEXT,
    "providerFee" DECIMAL(10,2),
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(10,2),
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2),
    "discountAmount" DECIMAL(10,2),
    "total" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "amountDue" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "billingAddress" JSONB,
    "taxIds" JSONB,
    "stripeInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLineItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "productId" TEXT,
    "productName" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),

    CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "usageDate" TIMESTAMP(3) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL,
    "percentOff" DECIMAL(5,2),
    "amountOff" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "maxUses" INTEGER,
    "maxUsesPerUser" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "applicableTiers" "SubscriptionTier"[],
    "minAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountRedemption" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountSaved" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingNotes" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "RoomGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "roomGroupId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "displayName" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hash" TEXT,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'LOCAL',
    "storagePath" TEXT NOT NULL,
    "storageUrl" TEXT,
    "bucketName" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "encoding" TEXT,
    "compression" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'PRIVATE',
    "status" "FileStatus" NOT NULL DEFAULT 'UPLOADING',
    "uploadedBy" TEXT NOT NULL,
    "scanStatus" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "scanResult" TEXT,
    "scannedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAttachment" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "entityType" "AttachmentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "purpose" "AttachmentPurpose" NOT NULL DEFAULT 'GENERAL',
    "order" INTEGER,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileVersion" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "hash" TEXT,
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileShare" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "shareType" "FileShareType" NOT NULL DEFAULT 'LINK',
    "password" TEXT,
    "maxDownloads" INTEGER,
    "currentDownloads" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sharedBy" TEXT NOT NULL,
    "sharedWith" TEXT[],
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileDownload" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "shareId" TEXT,
    "downloadedBy" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "size" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "data" JSONB,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailAppointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "emailNewMessages" BOOLEAN NOT NULL DEFAULT true,
    "emailWorksheetUpdates" BOOLEAN NOT NULL DEFAULT true,
    "emailSystemUpdates" BOOLEAN NOT NULL DEFAULT false,
    "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
    "pushAppointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "pushNewMessages" BOOLEAN NOT NULL DEFAULT true,
    "pushWorksheetUpdates" BOOLEAN NOT NULL DEFAULT true,
    "pushSystemUpdates" BOOLEAN NOT NULL DEFAULT true,
    "inAppMessages" BOOLEAN NOT NULL DEFAULT true,
    "inAppUpdates" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "quietHoursTimezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionLog" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT,
    "sessionType" "SessionType" NOT NULL,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "platform" TEXT,
    "quality" INTEGER,
    "notes" TEXT,
    "connectionIssues" BOOLEAN NOT NULL DEFAULT false,
    "recordingUrl" TEXT,
    "recordingSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionActivity" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "description" TEXT,
    "metadata" JSONB,

    CONSTRAINT "SessionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "UserActionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "page" TEXT,
    "component" TEXT,
    "metadata" JSONB,
    "sessionId" TEXT,
    "deviceInfo" JSONB,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapyProgress" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progressScore" DECIMAL(5,2) NOT NULL,
    "improvementAreas" TEXT[],
    "concernAreas" TEXT[],
    "goalsSet" JSONB,
    "goalsAchieved" JSONB,
    "nextMilestones" JSONB,
    "moodScore" INTEGER,
    "anxietyScore" INTEGER,
    "depressionScore" INTEGER,
    "functionalScore" INTEGER,
    "therapistNotes" TEXT,
    "clientFeedback" TEXT,
    "recommendations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistFiles" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistFiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_clientId_key" ON "Assessment"("clientId");

-- CreateIndex
CREATE INDEX "Assessment_clientId_idx" ON "Assessment"("clientId");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- CreateIndex
CREATE INDEX "Assessment_completedAt_idx" ON "Assessment"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Questionnaire_name_key" ON "Questionnaire"("name");

-- CreateIndex
CREATE INDEX "Questionnaire_category_idx" ON "Questionnaire"("category");

-- CreateIndex
CREATE INDEX "Questionnaire_isActive_idx" ON "Questionnaire"("isActive");

-- CreateIndex
CREATE INDEX "Question_questionnaireId_idx" ON "Question"("questionnaireId");

-- CreateIndex
CREATE INDEX "Question_order_idx" ON "Question"("order");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");

-- CreateIndex
CREATE INDEX "QuestionOption_order_idx" ON "QuestionOption"("order");

-- CreateIndex
CREATE INDEX "AssessmentQuestionnaire_assessmentId_idx" ON "AssessmentQuestionnaire"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentQuestionnaire_questionnaireId_idx" ON "AssessmentQuestionnaire"("questionnaireId");

-- CreateIndex
CREATE INDEX "AssessmentQuestionnaire_status_idx" ON "AssessmentQuestionnaire"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestionnaire_assessmentId_questionnaireId_key" ON "AssessmentQuestionnaire"("assessmentId", "questionnaireId");

-- CreateIndex
CREATE INDEX "Answer_assessmentQuestionnaireId_idx" ON "Answer"("assessmentQuestionnaireId");

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- CreateIndex
CREATE INDEX "Answer_selectedOptionId_idx" ON "Answer"("selectedOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_assessmentQuestionnaireId_questionId_key" ON "Answer"("assessmentQuestionnaireId", "questionId");

-- CreateIndex
CREATE INDEX "AssessmentScore_assessmentId_idx" ON "AssessmentScore"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentScore_category_idx" ON "AssessmentScore"("category");

-- CreateIndex
CREATE INDEX "AssessmentScore_severityLevel_idx" ON "AssessmentScore"("severityLevel");

-- CreateIndex
CREATE INDEX "MentalHealthIndicator_clientId_idx" ON "MentalHealthIndicator"("clientId");

-- CreateIndex
CREATE INDEX "MentalHealthIndicator_indicator_idx" ON "MentalHealthIndicator"("indicator");

-- CreateIndex
CREATE INDEX "MentalHealthIndicator_recordedAt_idx" ON "MentalHealthIndicator"("recordedAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");

-- CreateIndex
CREATE INDEX "SystemEvent_eventType_idx" ON "SystemEvent"("eventType");

-- CreateIndex
CREATE INDEX "SystemEvent_severity_idx" ON "SystemEvent"("severity");

-- CreateIndex
CREATE INDEX "SystemEvent_component_idx" ON "SystemEvent"("component");

-- CreateIndex
CREATE INDEX "SystemEvent_isResolved_idx" ON "SystemEvent"("isResolved");

-- CreateIndex
CREATE INDEX "SystemEvent_createdAt_idx" ON "SystemEvent"("createdAt");

-- CreateIndex
CREATE INDEX "DataChangeLog_tableName_idx" ON "DataChangeLog"("tableName");

-- CreateIndex
CREATE INDEX "DataChangeLog_recordId_idx" ON "DataChangeLog"("recordId");

-- CreateIndex
CREATE INDEX "DataChangeLog_operation_idx" ON "DataChangeLog"("operation");

-- CreateIndex
CREATE INDEX "DataChangeLog_changedBy_idx" ON "DataChangeLog"("changedBy");

-- CreateIndex
CREATE INDEX "DataChangeLog_createdAt_idx" ON "DataChangeLog"("createdAt");

-- CreateIndex
CREATE INDEX "DataChangeLog_dataClass_idx" ON "DataChangeLog"("dataClass");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_stripeProductId_key" ON "SubscriptionPlan"("stripeProductId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_tier_idx" ON "SubscriptionPlan"("tier");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_stripePaymentMethodId_key" ON "PaymentMethod"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");

-- CreateIndex
CREATE INDEX "PaymentMethod_type_idx" ON "PaymentMethod"("type");

-- CreateIndex
CREATE INDEX "PaymentMethod_isDefault_idx" ON "PaymentMethod"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_subscriptionId_idx" ON "Payment"("subscriptionId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_processedAt_idx" ON "Payment"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeInvoiceId_key" ON "Invoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "Invoice_subscriptionId_idx" ON "Invoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- CreateIndex
CREATE INDEX "Invoice_number_idx" ON "Invoice"("number");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId");

-- CreateIndex
CREATE INDEX "UsageRecord_subscriptionId_idx" ON "UsageRecord"("subscriptionId");

-- CreateIndex
CREATE INDEX "UsageRecord_feature_idx" ON "UsageRecord"("feature");

-- CreateIndex
CREATE INDEX "UsageRecord_usageDate_idx" ON "UsageRecord"("usageDate");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_code_key" ON "Discount"("code");

-- CreateIndex
CREATE INDEX "Discount_code_idx" ON "Discount"("code");

-- CreateIndex
CREATE INDEX "Discount_isActive_idx" ON "Discount"("isActive");

-- CreateIndex
CREATE INDEX "Discount_validFrom_validUntil_idx" ON "Discount"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "DiscountRedemption_discountId_idx" ON "DiscountRedemption"("discountId");

-- CreateIndex
CREATE INDEX "DiscountRedemption_userId_idx" ON "DiscountRedemption"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountRedemption_discountId_userId_key" ON "DiscountRedemption"("discountId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingNotes_id_key" ON "MeetingNotes"("id");

-- CreateIndex
CREATE INDEX "MeetingNotes_meetingId_idx" ON "MeetingNotes"("meetingId");

-- CreateIndex
CREATE INDEX "File_uploadedBy_idx" ON "File"("uploadedBy");

-- CreateIndex
CREATE INDEX "File_mimeType_idx" ON "File"("mimeType");

-- CreateIndex
CREATE INDEX "File_status_idx" ON "File"("status");

-- CreateIndex
CREATE INDEX "File_scanStatus_idx" ON "File"("scanStatus");

-- CreateIndex
CREATE INDEX "File_hash_idx" ON "File"("hash");

-- CreateIndex
CREATE INDEX "File_createdAt_idx" ON "File"("createdAt");

-- CreateIndex
CREATE INDEX "File_expiresAt_idx" ON "File"("expiresAt");

-- CreateIndex
CREATE INDEX "File_deletedAt_idx" ON "File"("deletedAt");

-- CreateIndex
CREATE INDEX "FileAttachment_fileId_idx" ON "FileAttachment"("fileId");

-- CreateIndex
CREATE INDEX "FileAttachment_entityType_entityId_idx" ON "FileAttachment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "FileAttachment_purpose_idx" ON "FileAttachment"("purpose");

-- CreateIndex
CREATE UNIQUE INDEX "FileAttachment_entityType_entityId_fileId_key" ON "FileAttachment"("entityType", "entityId", "fileId");

-- CreateIndex
CREATE INDEX "FileVersion_fileId_idx" ON "FileVersion"("fileId");

-- CreateIndex
CREATE INDEX "FileVersion_isActive_idx" ON "FileVersion"("isActive");

-- CreateIndex
CREATE INDEX "FileVersion_createdBy_idx" ON "FileVersion"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "FileVersion_fileId_version_key" ON "FileVersion"("fileId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "FileShare_shareToken_key" ON "FileShare"("shareToken");

-- CreateIndex
CREATE INDEX "FileShare_fileId_idx" ON "FileShare"("fileId");

-- CreateIndex
CREATE INDEX "FileShare_shareToken_idx" ON "FileShare"("shareToken");

-- CreateIndex
CREATE INDEX "FileShare_sharedBy_idx" ON "FileShare"("sharedBy");

-- CreateIndex
CREATE INDEX "FileShare_expiresAt_idx" ON "FileShare"("expiresAt");

-- CreateIndex
CREATE INDEX "FileShare_isActive_idx" ON "FileShare"("isActive");

-- CreateIndex
CREATE INDEX "FileDownload_fileId_idx" ON "FileDownload"("fileId");

-- CreateIndex
CREATE INDEX "FileDownload_shareId_idx" ON "FileDownload"("shareId");

-- CreateIndex
CREATE INDEX "FileDownload_downloadedBy_idx" ON "FileDownload"("downloadedBy");

-- CreateIndex
CREATE INDEX "FileDownload_createdAt_idx" ON "FileDownload"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_priority_idx" ON "Notification"("priority");

-- CreateIndex
CREATE INDEX "Notification_scheduledFor_idx" ON "Notification"("scheduledFor");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "NotificationSettings_userId_idx" ON "NotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "SessionLog_clientId_idx" ON "SessionLog"("clientId");

-- CreateIndex
CREATE INDEX "SessionLog_therapistId_idx" ON "SessionLog"("therapistId");

-- CreateIndex
CREATE INDEX "SessionLog_meetingId_idx" ON "SessionLog"("meetingId");

-- CreateIndex
CREATE INDEX "SessionLog_sessionType_idx" ON "SessionLog"("sessionType");

-- CreateIndex
CREATE INDEX "SessionLog_status_idx" ON "SessionLog"("status");

-- CreateIndex
CREATE INDEX "SessionLog_startTime_idx" ON "SessionLog"("startTime");

-- CreateIndex
CREATE INDEX "SessionActivity_sessionId_idx" ON "SessionActivity"("sessionId");

-- CreateIndex
CREATE INDEX "SessionActivity_activityType_idx" ON "SessionActivity"("activityType");

-- CreateIndex
CREATE INDEX "SessionActivity_timestamp_idx" ON "SessionActivity"("timestamp");

-- CreateIndex
CREATE INDEX "UserActivity_userId_idx" ON "UserActivity"("userId");

-- CreateIndex
CREATE INDEX "UserActivity_action_idx" ON "UserActivity"("action");

-- CreateIndex
CREATE INDEX "UserActivity_timestamp_idx" ON "UserActivity"("timestamp");

-- CreateIndex
CREATE INDEX "UserActivity_sessionId_idx" ON "UserActivity"("sessionId");

-- CreateIndex
CREATE INDEX "TherapyProgress_clientId_idx" ON "TherapyProgress"("clientId");

-- CreateIndex
CREATE INDEX "TherapyProgress_therapistId_idx" ON "TherapyProgress"("therapistId");

-- CreateIndex
CREATE INDEX "TherapyProgress_assessmentDate_idx" ON "TherapyProgress"("assessmentDate");

-- CreateIndex
CREATE INDEX "TherapyProgress_progressScore_idx" ON "TherapyProgress"("progressScore");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistFiles_id_key" ON "TherapistFiles"("id");

-- CreateIndex
CREATE INDEX "TherapistFiles_therapistId_idx" ON "TherapistFiles"("therapistId");

-- CreateIndex
CREATE INDEX "Post_roomId_idx" ON "Post"("roomId");

-- CreateIndex
CREATE INDEX "Therapist_status_idx" ON "Therapist"("status");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentQuestionnaire" ADD CONSTRAINT "AssessmentQuestionnaire_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentQuestionnaire" ADD CONSTRAINT "AssessmentQuestionnaire_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_assessmentQuestionnaireId_fkey" FOREIGN KEY ("assessmentQuestionnaireId") REFERENCES "AssessmentQuestionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "QuestionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentalHealthIndicator" ADD CONSTRAINT "MentalHealthIndicator_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_defaultPaymentMethodId_fkey" FOREIGN KEY ("defaultPaymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNotes" ADD CONSTRAINT "MeetingNotes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomGroup" ADD CONSTRAINT "RoomGroup_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomGroupId_fkey" FOREIGN KEY ("roomGroupId") REFERENCES "RoomGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileVersion" ADD CONSTRAINT "FileVersion_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileVersion" ADD CONSTRAINT "FileVersion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedBy_fkey" FOREIGN KEY ("sharedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileDownload" ADD CONSTRAINT "FileDownload_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileDownload" ADD CONSTRAINT "FileDownload_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "FileShare"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileDownload" ADD CONSTRAINT "FileDownload_downloadedBy_fkey" FOREIGN KEY ("downloadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLog" ADD CONSTRAINT "SessionLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLog" ADD CONSTRAINT "SessionLog_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLog" ADD CONSTRAINT "SessionLog_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionActivity" ADD CONSTRAINT "SessionActivity_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SessionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapyProgress" ADD CONSTRAINT "TherapyProgress_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapyProgress" ADD CONSTRAINT "TherapyProgress_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_processedByAdminId_fkey" FOREIGN KEY ("processedByAdminId") REFERENCES "Admin"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistFiles" ADD CONSTRAINT "TherapistFiles_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
