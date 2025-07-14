-- Add Performance Indexes Migration
-- Generated at: 2025-07-14 12:00:00
-- Description: Add critical database indexes for improved query performance

-- User model indexes for activity tracking and filtering
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
CREATE INDEX "User_isVerified_idx" ON "User"("isVerified");
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");
CREATE INDEX "User_suspendedAt_idx" ON "User"("suspendedAt") WHERE "suspendedAt" IS NOT NULL;

-- Therapist model indexes for search and admin operations
CREATE INDEX "Therapist_province_idx" ON "Therapist"("province");
CREATE INDEX "Therapist_licenseVerified_idx" ON "Therapist"("licenseVerified");
CREATE INDEX "Therapist_hourlyRate_idx" ON "Therapist"("hourlyRate");
CREATE INDEX "Therapist_createdAt_idx" ON "Therapist"("createdAt");
CREATE INDEX "Therapist_status_licenseVerified_idx" ON "Therapist"("status", "licenseVerified");
CREATE INDEX "Therapist_processedByAdminId_idx" ON "Therapist"("processedByAdminId") WHERE "processedByAdminId" IS NOT NULL;
CREATE INDEX "Therapist_submissionDate_idx" ON "Therapist"("submissionDate");

-- Meeting model indexes for booking queries
CREATE INDEX "Meeting_clientId_startTime_idx" ON "Meeting"("clientId", "startTime");
CREATE INDEX "Meeting_createdAt_idx" ON "Meeting"("createdAt");
CREATE INDEX "Meeting_meetingType_idx" ON "Meeting"("meetingType");
CREATE INDEX "Meeting_status_startTime_idx" ON "Meeting"("status", "startTime");

-- Message model indexes for messaging performance
CREATE INDEX "Message_replyToId_idx" ON "Message"("replyToId") WHERE "replyToId" IS NOT NULL;
CREATE INDEX "Message_senderId_createdAt_idx" ON "Message"("senderId", "createdAt");
CREATE INDEX "Message_attachmentUrl_idx" ON "Message"("attachmentUrl") WHERE "attachmentUrl" IS NOT NULL;
CREATE INDEX "Message_isEdited_idx" ON "Message"("isEdited");

-- Post model indexes for community features
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
CREATE INDEX "Post_roomId_createdAt_idx" ON "Post"("roomId", "createdAt");
CREATE INDEX "Post_userId_createdAt_idx" ON "Post"("userId", "createdAt");
CREATE INDEX "Post_title_idx" ON "Post"("title");

-- Review model indexes for therapist evaluation
CREATE INDEX "Review_therapistId_status_idx" ON "Review"("therapistId", "status");
CREATE INDEX "Review_isAnonymous_idx" ON "Review"("isAnonymous");
CREATE INDEX "Review_moderatedBy_idx" ON "Review"("moderatedBy") WHERE "moderatedBy" IS NOT NULL;
CREATE INDEX "Review_therapistId_rating_idx" ON "Review"("therapistId", "rating");
CREATE INDEX "Review_isVerified_idx" ON "Review"("isVerified");

-- Worksheet model indexes for assignment management
CREATE INDEX "Worksheet_dueDate_idx" ON "Worksheet"("dueDate") WHERE "dueDate" IS NOT NULL;
CREATE INDEX "Worksheet_clientId_status_idx" ON "Worksheet"("clientId", "status");
CREATE INDEX "Worksheet_therapistId_status_idx" ON "Worksheet"("therapistId", "status");
CREATE INDEX "Worksheet_clientId_dueDate_idx" ON "Worksheet"("clientId", "dueDate") WHERE "dueDate" IS NOT NULL;
CREATE INDEX "Worksheet_submittedAt_idx" ON "Worksheet"("submittedAt") WHERE "submittedAt" IS NOT NULL;

-- Notification model indexes for delivery tracking
CREATE INDEX "Notification_sentAt_idx" ON "Notification"("sentAt") WHERE "sentAt" IS NOT NULL;
CREATE INDEX "Notification_type_createdAt_idx" ON "Notification"("type", "createdAt");
CREATE INDEX "Notification_priority_scheduledFor_idx" ON "Notification"("priority", "scheduledFor") WHERE "scheduledFor" IS NOT NULL;

-- File model indexes for storage management
CREATE INDEX "File_storageProvider_idx" ON "File"("storageProvider");
CREATE INDEX "File_size_idx" ON "File"("size");
CREATE INDEX "File_isPublic_idx" ON "File"("isPublic");
CREATE INDEX "File_accessLevel_idx" ON "File"("accessLevel");
CREATE INDEX "File_uploadedBy_createdAt_idx" ON "File"("uploadedBy", "createdAt");

-- Payment model indexes for billing analytics
CREATE INDEX "Payment_amount_idx" ON "Payment"("amount");
CREATE INDEX "Payment_currency_idx" ON "Payment"("currency");
CREATE INDEX "Payment_provider_idx" ON "Payment"("provider");
CREATE INDEX "Payment_processedAt_status_idx" ON "Payment"("processedAt", "status") WHERE "processedAt" IS NOT NULL;
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- SessionLog model indexes for session tracking
CREATE INDEX "SessionLog_endTime_idx" ON "SessionLog"("endTime") WHERE "endTime" IS NOT NULL;
CREATE INDEX "SessionLog_duration_idx" ON "SessionLog"("duration") WHERE "duration" IS NOT NULL;
CREATE INDEX "SessionLog_clientId_startTime_idx" ON "SessionLog"("clientId", "startTime");
CREATE INDEX "SessionLog_therapistId_startTime_idx" ON "SessionLog"("therapistId", "startTime");
CREATE INDEX "SessionLog_platform_idx" ON "SessionLog"("platform");
CREATE INDEX "SessionLog_quality_idx" ON "SessionLog"("quality") WHERE "quality" IS NOT NULL;

-- Assessment model indexes for mental health tracking
CREATE INDEX "Assessment_startedAt_idx" ON "Assessment"("startedAt") WHERE "startedAt" IS NOT NULL;
CREATE INDEX "Assessment_overallRisk_idx" ON "Assessment"("overallRisk") WHERE "overallRisk" IS NOT NULL;
CREATE INDEX "Assessment_confidenceScore_idx" ON "Assessment"("confidenceScore") WHERE "confidenceScore" IS NOT NULL;

-- Conversation model indexes for messaging
CREATE INDEX "Conversation_createdAt_idx" ON "Conversation"("createdAt");
CREATE INDEX "Conversation_type_isActive_idx" ON "Conversation"("type", "isActive");

-- FileAttachment model indexes for attachment management
CREATE INDEX "FileAttachment_entityType_idx" ON "FileAttachment"("entityType");
CREATE INDEX "FileAttachment_order_idx" ON "FileAttachment"("order");

-- MatchHistory model indexes for analytics
CREATE INDEX "MatchHistory_wasViewed_idx" ON "MatchHistory"("wasViewed");
CREATE INDEX "MatchHistory_wasContacted_idx" ON "MatchHistory"("wasContacted");
CREATE INDEX "MatchHistory_sessionCount_idx" ON "MatchHistory"("sessionCount");
CREATE INDEX "MatchHistory_clientSatisfactionScore_idx" ON "MatchHistory"("clientSatisfactionScore") WHERE "clientSatisfactionScore" IS NOT NULL;
CREATE INDEX "MatchHistory_recommendationAlgorithm_idx" ON "MatchHistory"("recommendationAlgorithm");

-- PushSubscription model indexes for push notifications
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");
CREATE INDEX "PushSubscription_endpoint_idx" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_createdAt_idx" ON "PushSubscription"("createdAt");

-- Add comments for documentation
COMMENT ON INDEX "User_lastLoginAt_idx" IS 'Optimizes user activity tracking queries';
COMMENT ON INDEX "User_role_isActive_idx" IS 'Optimizes role-based active user filtering';
COMMENT ON INDEX "Therapist_status_licenseVerified_idx" IS 'Optimizes approved verified therapist queries';
COMMENT ON INDEX "Meeting_clientId_startTime_idx" IS 'Optimizes client appointment history queries';
COMMENT ON INDEX "Message_senderId_createdAt_idx" IS 'Optimizes user message history queries';
COMMENT ON INDEX "Post_roomId_createdAt_idx" IS 'Optimizes room timeline queries';
COMMENT ON INDEX "Review_therapistId_status_idx" IS 'Optimizes approved therapist review queries';
COMMENT ON INDEX "Worksheet_clientId_status_idx" IS 'Optimizes client worksheet status queries';
COMMENT ON INDEX "Notification_type_createdAt_idx" IS 'Optimizes notification type analytics';
COMMENT ON INDEX "File_uploadedBy_createdAt_idx" IS 'Optimizes user file history queries';
COMMENT ON INDEX "Payment_processedAt_status_idx" IS 'Optimizes payment processing queries';
COMMENT ON INDEX "SessionLog_clientId_startTime_idx" IS 'Optimizes client session history queries';