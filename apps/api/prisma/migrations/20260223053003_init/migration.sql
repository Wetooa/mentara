-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'WAITING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ChatbotMessageRole" AS ENUM ('SYSTEM', 'USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('VIRTUAL', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "GroupSessionStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'GROUP', 'SESSION', 'SUPPORT');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING', 'INCOMING_VIDEO_CALL', 'VIDEO_CALL_MISSED', 'VIDEO_CALL_ENDED');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'GCASH', 'MAYA', 'INSURANCE');

-- CreateEnum
CREATE TYPE "PreAssessmentMethod" AS ENUM ('CHECKLIST', 'CHATBOT', 'HYBRID');

-- CreateEnum
CREATE TYPE "TherapistApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WorksheetStatus" AS ENUM ('ASSIGNED', 'SUBMITTED', 'REVIEWED', 'OVERDUE');

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "meetingType" TEXT NOT NULL DEFAULT 'video',
    "meetingUrl" TEXT,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "TherapistAvailability" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "clientId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "currentQuestionnaire" TEXT,
    "completedQuestionnaires" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "presentedQuestionnaires" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "collectedAnswers" JSONB NOT NULL,
    "structuredAnswers" JSONB,
    "conversationInsights" JSONB,
    "completionReason" TEXT,
    "completionConfidence" DOUBLE PRECISION,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "ChatbotMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "questionnaireContext" TEXT,
    "extractedAnswer" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientEngagement" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "loginFrequency" INTEGER NOT NULL DEFAULT 0,
    "platformUsageScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "journalEntryCount" INTEGER NOT NULL DEFAULT 0,
    "worksheetCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "meetingAttendanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "averageSessionRating" DOUBLE PRECISION,
    "engagementTrend" TEXT NOT NULL DEFAULT 'stable',
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPreferences" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "genderPreference" TEXT,
    "agePreference" TEXT,
    "languagePreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "treatmentApproaches" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sessionFormat" TEXT,
    "sessionFrequency" TEXT,
    "budgetRange" TEXT,
    "locationPreference" TEXT,
    "availabilityPreference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specialConsiderations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientTherapist" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientTherapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeratorCommunity" (
    "id" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModeratorCommunity_pkey" PRIMARY KEY ("id")
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
    "postingRole" TEXT NOT NULL DEFAULT 'member',
    "roomGroupId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT,
    "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attachmentNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attachmentSizes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attachmentNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attachmentSizes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentHeart" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CommentHeart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostHeart" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PostHeart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "content" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "postId" TEXT,
    "commentId" TEXT,
    "reportedUserId" TEXT,
    "reporterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupTherapySessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "communityId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "sessionType" "SessionType" NOT NULL,
    "sessionFormat" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "virtualLink" TEXT,
    "location" TEXT,
    "locationAddress" TEXT,
    "status" "GroupSessionStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupTherapySessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupSessionTherapistInvitations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupSessionTherapistInvitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupSessionParticipants" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'REGISTERED',
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupSessionParticipants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL DEFAULT 'DIRECT',
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),
    "role" "ParticipantRole" NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attachmentNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attachmentSizes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "replyToId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReadReceipt" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageReadReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypingIndicator" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isTyping" BOOLEAN NOT NULL DEFAULT true,
    "lastTypingAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TypingIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "meetingId" TEXT,
    "paymentMethodId" TEXT,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL DEFAULT 'CARD',
    "nickname" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3),
    "cardLast4" TEXT,
    "cardBrand" TEXT,
    "cardholderName" TEXT,
    "cardNumber" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "cardType" TEXT,
    "bankName" TEXT,
    "accountHolderName" TEXT,
    "accountType" TEXT,
    "routingNumber" TEXT,
    "accountLast4" TEXT,
    "walletProvider" TEXT,
    "walletEmail" TEXT,
    "walletAccountName" TEXT,
    "gcashNumber" TEXT,
    "gcashName" TEXT,
    "isVerified" BOOLEAN,
    "gcashEmail" TEXT,
    "mayaNumber" TEXT,
    "mayaName" TEXT,
    "mayaVerified" BOOLEAN,
    "mayaEmail" TEXT,
    "insuranceProviderName" TEXT,
    "policyNumber" TEXT,
    "memberId" TEXT,
    "groupNumber" TEXT,
    "insuranceVerified" BOOLEAN DEFAULT false,
    "coverageDetails" JSONB,
    "billingAddress" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreAssessment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT,
    "sessionId" TEXT,
    "answers" JSONB NOT NULL,
    "method" "PreAssessmentMethod" NOT NULL DEFAULT 'CHECKLIST',
    "data" JSONB NOT NULL,
    "context" JSONB,
    "soapAnalysisUrl" TEXT,
    "conversationHistoryUrl" TEXT,

    CONSTRAINT "PreAssessment_pkey" PRIMARY KEY ("id")
);

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
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistPerformance" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "averageResponseTime" INTEGER,
    "clientRetentionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "noShowRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cancellationRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "averageSessionDuration" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "clientProgressRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "workloadCapacity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "availabilityUtilization" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Therapist" (
    "userId" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" "TherapistApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedByAdminId" TEXT,
    "providerType" TEXT NOT NULL,
    "professionalLicenseType" TEXT NOT NULL,
    "isPRCLicensed" TEXT NOT NULL,
    "prcLicenseNumber" TEXT NOT NULL,
    "expirationDateOfLicense" TIMESTAMP(3) NOT NULL,
    "practiceStartDate" TIMESTAMP(3) NOT NULL,
    "licenseVerified" BOOLEAN NOT NULL DEFAULT false,
    "licenseVerifiedAt" TIMESTAMP(3),
    "licenseVerifiedBy" TEXT,
    "certifications" JSONB,
    "certificateUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certificateNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "licenseUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "licenseNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documentNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "yearsOfExperience" INTEGER,
    "educationBackground" TEXT,
    "specialCertifications" TEXT[],
    "practiceLocation" TEXT,
    "acceptsInsurance" BOOLEAN NOT NULL DEFAULT false,
    "acceptedInsuranceTypes" TEXT[],
    "areasOfExpertise" TEXT[],
    "assessmentTools" TEXT[],
    "therapeuticApproachesUsedList" TEXT[],
    "languagesOffered" TEXT[],
    "providedOnlineTherapyBefore" BOOLEAN NOT NULL,
    "comfortableUsingVideoConferencing" BOOLEAN NOT NULL,
    "preferredSessionLength" INTEGER[],
    "privateConfidentialSpace" TEXT,
    "compliesWithDataPrivacyAct" BOOLEAN NOT NULL,
    "professionalLiabilityInsurance" TEXT,
    "complaintsOrDisciplinaryActions" TEXT,
    "willingToAbideByPlatformGuidelines" BOOLEAN NOT NULL,
    "expertise" TEXT[],
    "approaches" TEXT[],
    "languages" TEXT[],
    "illnessSpecializations" TEXT[],
    "acceptTypes" TEXT[],
    "treatmentSuccessRates" JSONB NOT NULL,
    "sessionLength" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Therapist_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "role" TEXT NOT NULL DEFAULT 'client',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "emailVerifyTokenExp" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "avatarUrl" TEXT,
    "coverImageUrl" TEXT,
    "bio" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" TEXT,
    "suspensionReason" TEXT,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedBy" TEXT,
    "deactivationReason" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "lockoutUntil" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "userId" TEXT NOT NULL,
    "hasSeenTherapistRecommendations" BOOLEAN NOT NULL DEFAULT false,
    "birthdate" TIMESTAMP(3),
    "city" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Moderator" (
    "userId" TEXT NOT NULL,
    "permissions" TEXT[],
    "assignedCommunities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Moderator_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "userId" TEXT NOT NULL,
    "permissions" TEXT[],
    "adminLevel" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Worksheet" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "WorksheetStatus" NOT NULL DEFAULT 'ASSIGNED',
    "materialUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "materialNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worksheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorksheetSubmission" (
    "id" TEXT NOT NULL,
    "worksheetId" TEXT NOT NULL,
    "fileUrls" TEXT[],
    "fileNames" TEXT[],
    "fileSizes" INTEGER[],
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedback" TEXT,

    CONSTRAINT "WorksheetSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_clientId_idx" ON "Meeting"("clientId");

-- CreateIndex
CREATE INDEX "Meeting_therapistId_idx" ON "Meeting"("therapistId");

-- CreateIndex
CREATE INDEX "Meeting_startTime_idx" ON "Meeting"("startTime");

-- CreateIndex
CREATE INDEX "Meeting_endTime_idx" ON "Meeting"("endTime");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

-- CreateIndex
CREATE INDEX "Meeting_therapistId_startTime_status_idx" ON "Meeting"("therapistId", "startTime", "status");

-- CreateIndex
CREATE INDEX "Meeting_therapistId_status_startTime_idx" ON "Meeting"("therapistId", "status", "startTime");

-- CreateIndex
CREATE INDEX "Meeting_clientId_status_startTime_idx" ON "Meeting"("clientId", "status", "startTime");

-- CreateIndex
CREATE INDEX "Meeting_therapistId_startTime_endTime_idx" ON "Meeting"("therapistId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "Meeting_clientId_startTime_endTime_idx" ON "Meeting"("clientId", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingNotes_id_key" ON "MeetingNotes"("id");

-- CreateIndex
CREATE INDEX "MeetingNotes_meetingId_idx" ON "MeetingNotes"("meetingId");

-- CreateIndex
CREATE INDEX "TherapistAvailability_therapistId_idx" ON "TherapistAvailability"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistAvailability_dayOfWeek_idx" ON "TherapistAvailability"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistAvailability_therapistId_dayOfWeek_startTime_endTi_key" ON "TherapistAvailability"("therapistId", "dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotSession_sessionId_key" ON "ChatbotSession"("sessionId");

-- CreateIndex
CREATE INDEX "ChatbotSession_userId_idx" ON "ChatbotSession"("userId");

-- CreateIndex
CREATE INDEX "ChatbotSession_clientId_idx" ON "ChatbotSession"("clientId");

-- CreateIndex
CREATE INDEX "ChatbotSession_sessionId_idx" ON "ChatbotSession"("sessionId");

-- CreateIndex
CREATE INDEX "ChatbotSession_isComplete_idx" ON "ChatbotSession"("isComplete");

-- CreateIndex
CREATE INDEX "ChatbotSession_lastActivity_idx" ON "ChatbotSession"("lastActivity");

-- CreateIndex
CREATE INDEX "ChatbotSession_clientId_isComplete_idx" ON "ChatbotSession"("clientId", "isComplete");

-- CreateIndex
CREATE INDEX "ChatbotSession_userId_isComplete_idx" ON "ChatbotSession"("userId", "isComplete");

-- CreateIndex
CREATE INDEX "ChatbotMessage_sessionId_idx" ON "ChatbotMessage"("sessionId");

-- CreateIndex
CREATE INDEX "ChatbotMessage_sessionId_timestamp_idx" ON "ChatbotMessage"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "ChatbotMessage_role_idx" ON "ChatbotMessage"("role");

-- CreateIndex
CREATE INDEX "ChatbotMessage_timestamp_idx" ON "ChatbotMessage"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ClientEngagement_clientId_key" ON "ClientEngagement"("clientId");

-- CreateIndex
CREATE INDEX "ClientEngagement_clientId_idx" ON "ClientEngagement"("clientId");

-- CreateIndex
CREATE INDEX "ClientEngagement_engagementTrend_idx" ON "ClientEngagement"("engagementTrend");

-- CreateIndex
CREATE INDEX "ClientEngagement_platformUsageScore_idx" ON "ClientEngagement"("platformUsageScore");

-- CreateIndex
CREATE UNIQUE INDEX "ClientPreferences_clientId_key" ON "ClientPreferences"("clientId");

-- CreateIndex
CREATE INDEX "ClientPreferences_clientId_idx" ON "ClientPreferences"("clientId");

-- CreateIndex
CREATE INDEX "ClientTherapist_clientId_idx" ON "ClientTherapist"("clientId");

-- CreateIndex
CREATE INDEX "ClientTherapist_therapistId_idx" ON "ClientTherapist"("therapistId");

-- CreateIndex
CREATE INDEX "ClientTherapist_clientId_status_idx" ON "ClientTherapist"("clientId", "status");

-- CreateIndex
CREATE INDEX "ClientTherapist_therapistId_status_idx" ON "ClientTherapist"("therapistId", "status");

-- CreateIndex
CREATE INDEX "ClientTherapist_status_idx" ON "ClientTherapist"("status");

-- CreateIndex
CREATE INDEX "ClientTherapist_assignedAt_idx" ON "ClientTherapist"("assignedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientTherapist_clientId_therapistId_key" ON "ClientTherapist"("clientId", "therapistId");

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_key" ON "Community"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");

-- CreateIndex
CREATE INDEX "Community_name_idx" ON "Community"("name");

-- CreateIndex
CREATE INDEX "Community_slug_idx" ON "Community"("slug");

-- CreateIndex
CREATE INDEX "Community_createdAt_idx" ON "Community"("createdAt");

-- CreateIndex
CREATE INDEX "Community_updatedAt_idx" ON "Community"("updatedAt");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_communityId_idx" ON "Membership"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_communityId_key" ON "Membership"("userId", "communityId");

-- CreateIndex
CREATE INDEX "ModeratorCommunity_moderatorId_idx" ON "ModeratorCommunity"("moderatorId");

-- CreateIndex
CREATE INDEX "ModeratorCommunity_communityId_idx" ON "ModeratorCommunity"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "ModeratorCommunity_moderatorId_communityId_key" ON "ModeratorCommunity"("moderatorId", "communityId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_roomId_idx" ON "Post"("roomId");

-- CreateIndex
CREATE INDEX "Post_roomId_createdAt_idx" ON "Post"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_userId_createdAt_idx" ON "Post"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_title_idx" ON "Post"("title");

-- CreateIndex
CREATE INDEX "Post_roomId_userId_createdAt_idx" ON "Post"("roomId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_postId_parentId_idx" ON "Comment"("postId", "parentId");

-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "CommentHeart_commentId_idx" ON "CommentHeart"("commentId");

-- CreateIndex
CREATE INDEX "CommentHeart_userId_idx" ON "CommentHeart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentHeart_commentId_userId_key" ON "CommentHeart"("commentId", "userId");

-- CreateIndex
CREATE INDEX "PostHeart_postId_idx" ON "PostHeart"("postId");

-- CreateIndex
CREATE INDEX "PostHeart_userId_idx" ON "PostHeart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostHeart_postId_userId_key" ON "PostHeart"("postId", "userId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_postId_idx" ON "Report"("postId");

-- CreateIndex
CREATE INDEX "Report_commentId_idx" ON "Report"("commentId");

-- CreateIndex
CREATE INDEX "Report_reportedUserId_idx" ON "Report"("reportedUserId");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "GroupTherapySessions_communityId_idx" ON "GroupTherapySessions"("communityId");

-- CreateIndex
CREATE INDEX "GroupTherapySessions_createdById_idx" ON "GroupTherapySessions"("createdById");

-- CreateIndex
CREATE INDEX "GroupTherapySessions_status_idx" ON "GroupTherapySessions"("status");

-- CreateIndex
CREATE INDEX "GroupTherapySessions_scheduledAt_idx" ON "GroupTherapySessions"("scheduledAt");

-- CreateIndex
CREATE INDEX "GroupSessionTherapistInvitations_therapistId_status_idx" ON "GroupSessionTherapistInvitations"("therapistId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GroupSessionTherapistInvitations_sessionId_therapistId_key" ON "GroupSessionTherapistInvitations"("sessionId", "therapistId");

-- CreateIndex
CREATE INDEX "GroupSessionParticipants_userId_idx" ON "GroupSessionParticipants"("userId");

-- CreateIndex
CREATE INDEX "GroupSessionParticipants_sessionId_attendanceStatus_idx" ON "GroupSessionParticipants"("sessionId", "attendanceStatus");

-- CreateIndex
CREATE UNIQUE INDEX "GroupSessionParticipants_sessionId_userId_key" ON "GroupSessionParticipants"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_idx" ON "JournalEntry"("userId");

-- CreateIndex
CREATE INDEX "JournalEntry_createdAt_idx" ON "JournalEntry"("createdAt");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_createdAt_idx" ON "JournalEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_isActive_idx" ON "Conversation"("isActive");

-- CreateIndex
CREATE INDEX "Conversation_type_idx" ON "Conversation"("type");

-- CreateIndex
CREATE INDEX "Conversation_type_lastMessageAt_idx" ON "Conversation"("type", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_type_isActive_lastMessageAt_idx" ON "Conversation"("type", "isActive", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_createdAt_idx" ON "Conversation"("createdAt");

-- CreateIndex
CREATE INDEX "Conversation_isActive_lastMessageAt_idx" ON "Conversation"("isActive", "lastMessageAt");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_isActive_idx" ON "ConversationParticipant"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_isDeleted_idx" ON "Message"("conversationId", "createdAt", "isDeleted");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_messageType_idx" ON "Message"("messageType");

-- CreateIndex
CREATE INDEX "Message_isDeleted_idx" ON "Message"("isDeleted");

-- CreateIndex
CREATE INDEX "Message_senderId_createdAt_idx" ON "Message"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_senderId_createdAt_idx" ON "Message"("conversationId", "senderId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_replyToId_idx" ON "Message"("replyToId");

-- CreateIndex
CREATE INDEX "Message_conversationId_messageType_idx" ON "Message"("conversationId", "messageType");

-- CreateIndex
CREATE INDEX "MessageReadReceipt_messageId_idx" ON "MessageReadReceipt"("messageId");

-- CreateIndex
CREATE INDEX "MessageReadReceipt_userId_idx" ON "MessageReadReceipt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReadReceipt_messageId_userId_key" ON "MessageReadReceipt"("messageId", "userId");

-- CreateIndex
CREATE INDEX "MessageReaction_messageId_idx" ON "MessageReaction"("messageId");

-- CreateIndex
CREATE INDEX "MessageReaction_userId_idx" ON "MessageReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReaction_messageId_userId_emoji_key" ON "MessageReaction"("messageId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "TypingIndicator_conversationId_idx" ON "TypingIndicator"("conversationId");

-- CreateIndex
CREATE INDEX "TypingIndicator_lastTypingAt_idx" ON "TypingIndicator"("lastTypingAt");

-- CreateIndex
CREATE UNIQUE INDEX "TypingIndicator_conversationId_userId_key" ON "TypingIndicator"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "UserBlock_blockerId_idx" ON "UserBlock"("blockerId");

-- CreateIndex
CREATE INDEX "UserBlock_blockedId_idx" ON "UserBlock"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_blockerId_blockedId_key" ON "UserBlock"("blockerId", "blockedId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_priority_idx" ON "Notification"("priority");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_type_createdAt_idx" ON "Notification"("userId", "type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Payment_clientId_idx" ON "Payment"("clientId");

-- CreateIndex
CREATE INDEX "Payment_therapistId_idx" ON "Payment"("therapistId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_meetingId_idx" ON "Payment"("meetingId");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_therapistId_status_createdAt_idx" ON "Payment"("therapistId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");

-- CreateIndex
CREATE INDEX "PaymentMethod_isDefault_idx" ON "PaymentMethod"("isDefault");

-- CreateIndex
CREATE INDEX "PaymentMethod_type_idx" ON "PaymentMethod"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PreAssessment_sessionId_key" ON "PreAssessment"("sessionId");

-- CreateIndex
CREATE INDEX "PreAssessment_clientId_idx" ON "PreAssessment"("clientId");

-- CreateIndex
CREATE INDEX "PreAssessment_sessionId_idx" ON "PreAssessment"("sessionId");

-- CreateIndex
CREATE INDEX "PreAssessment_method_idx" ON "PreAssessment"("method");

-- CreateIndex
CREATE INDEX "Review_therapistId_idx" ON "Review"("therapistId");

-- CreateIndex
CREATE INDEX "Review_clientId_idx" ON "Review"("clientId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE INDEX "Review_therapistId_rating_idx" ON "Review"("therapistId", "rating");

-- CreateIndex
CREATE INDEX "Review_therapistId_createdAt_idx" ON "Review"("therapistId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_clientId_therapistId_meetingId_key" ON "Review"("clientId", "therapistId", "meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistPerformance_therapistId_key" ON "TherapistPerformance"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistPerformance_therapistId_idx" ON "TherapistPerformance"("therapistId");

-- CreateIndex
CREATE INDEX "TherapistPerformance_clientRetentionRate_idx" ON "TherapistPerformance"("clientRetentionRate");

-- CreateIndex
CREATE INDEX "TherapistPerformance_workloadCapacity_idx" ON "TherapistPerformance"("workloadCapacity");

-- CreateIndex
CREATE INDEX "TherapistPerformance_availabilityUtilization_idx" ON "TherapistPerformance"("availabilityUtilization");

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_userId_key" ON "Therapist"("userId");

-- CreateIndex
CREATE INDEX "Therapist_userId_idx" ON "Therapist"("userId");

-- CreateIndex
CREATE INDEX "Therapist_status_idx" ON "Therapist"("status");

-- CreateIndex
CREATE INDEX "Therapist_timezone_idx" ON "Therapist"("timezone");

-- CreateIndex
CREATE INDEX "Therapist_status_createdAt_idx" ON "Therapist"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Therapist_status_hourlyRate_idx" ON "Therapist"("status", "hourlyRate");

-- CreateIndex
CREATE INDEX "Therapist_province_idx" ON "Therapist"("province");

-- CreateIndex
CREATE INDEX "Therapist_yearsOfExperience_idx" ON "Therapist"("yearsOfExperience");

-- CreateIndex
CREATE INDEX "Therapist_hourlyRate_idx" ON "Therapist"("hourlyRate");

-- CreateIndex
CREATE INDEX "Therapist_createdAt_idx" ON "Therapist"("createdAt");

-- CreateIndex
CREATE INDEX "Therapist_province_status_idx" ON "Therapist"("province", "status");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerifyToken_key" ON "User"("emailVerifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "User_role_isActive_createdAt_idx" ON "User"("role", "isActive", "createdAt");

-- CreateIndex
CREATE INDEX "User_email_isActive_idx" ON "User"("email", "isActive");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");

-- CreateIndex
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Moderator_userId_key" ON "Moderator"("userId");

-- CreateIndex
CREATE INDEX "Moderator_userId_idx" ON "Moderator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "Admin_userId_idx" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "Worksheet_clientId_idx" ON "Worksheet"("clientId");

-- CreateIndex
CREATE INDEX "Worksheet_therapistId_idx" ON "Worksheet"("therapistId");

-- CreateIndex
CREATE INDEX "Worksheet_status_idx" ON "Worksheet"("status");

-- CreateIndex
CREATE INDEX "Worksheet_dueDate_idx" ON "Worksheet"("dueDate");

-- CreateIndex
CREATE INDEX "Worksheet_status_dueDate_idx" ON "Worksheet"("status", "dueDate");

-- CreateIndex
CREATE INDEX "Worksheet_clientId_status_idx" ON "Worksheet"("clientId", "status");

-- CreateIndex
CREATE INDEX "Worksheet_therapistId_status_idx" ON "Worksheet"("therapistId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WorksheetSubmission_worksheetId_key" ON "WorksheetSubmission"("worksheetId");

-- CreateIndex
CREATE INDEX "WorksheetSubmission_worksheetId_idx" ON "WorksheetSubmission"("worksheetId");

-- CreateIndex
CREATE INDEX "WorksheetSubmission_submittedAt_idx" ON "WorksheetSubmission"("submittedAt");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNotes" ADD CONSTRAINT "MeetingNotes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistAvailability" ADD CONSTRAINT "TherapistAvailability_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotSession" ADD CONSTRAINT "ChatbotSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotMessage" ADD CONSTRAINT "ChatbotMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatbotSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientEngagement" ADD CONSTRAINT "ClientEngagement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPreferences" ADD CONSTRAINT "ClientPreferences_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTherapist" ADD CONSTRAINT "ClientTherapist_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTherapist" ADD CONSTRAINT "ClientTherapist_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorCommunity" ADD CONSTRAINT "ModeratorCommunity_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorCommunity" ADD CONSTRAINT "ModeratorCommunity_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderator"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomGroup" ADD CONSTRAINT "RoomGroup_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomGroupId_fkey" FOREIGN KEY ("roomGroupId") REFERENCES "RoomGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentHeart" ADD CONSTRAINT "CommentHeart_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentHeart" ADD CONSTRAINT "CommentHeart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHeart" ADD CONSTRAINT "PostHeart_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHeart" ADD CONSTRAINT "PostHeart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupTherapySessions" ADD CONSTRAINT "GroupTherapySessions_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupTherapySessions" ADD CONSTRAINT "GroupTherapySessions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupSessionTherapistInvitations" ADD CONSTRAINT "GroupSessionTherapistInvitations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GroupTherapySessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupSessionTherapistInvitations" ADD CONSTRAINT "GroupSessionTherapistInvitations_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupSessionParticipants" ADD CONSTRAINT "GroupSessionParticipants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GroupTherapySessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupSessionParticipants" ADD CONSTRAINT "GroupSessionParticipants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReadReceipt" ADD CONSTRAINT "MessageReadReceipt_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReadReceipt" ADD CONSTRAINT "MessageReadReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreAssessment" ADD CONSTRAINT "PreAssessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistPerformance" ADD CONSTRAINT "TherapistPerformance_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_processedByAdminId_fkey" FOREIGN KEY ("processedByAdminId") REFERENCES "Admin"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderator" ADD CONSTRAINT "Moderator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worksheet" ADD CONSTRAINT "Worksheet_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worksheet" ADD CONSTRAINT "Worksheet_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetSubmission" ADD CONSTRAINT "WorksheetSubmission_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "Worksheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
