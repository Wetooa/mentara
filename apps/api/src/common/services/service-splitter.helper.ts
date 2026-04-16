/**
 * Service Splitter Helper
 * Provides guidance and utilities for splitting large services
 * 
 * Guidelines:
 * - Services over 1000 lines should be split
 * - Extract related functionality into separate services
 * - Use dependency injection to maintain relationships
 * - Keep services focused on single responsibility
 */

export interface ServiceSplitRecommendation {
  serviceName: string;
  currentLines: number;
  recommendedSplits: {
    name: string;
    responsibility: string;
    estimatedLines: number;
  }[];
}

/**
 * Service splitting recommendations for large services
 */
export const SERVICE_SPLIT_RECOMMENDATIONS: ServiceSplitRecommendation[] = [
  {
    serviceName: 'NotificationsService',
    currentLines: 1814,
    recommendedSplits: [
      {
        name: 'NotificationDeliveryService',
        responsibility: 'Handle delivery methods (WebSocket, email, push)',
        estimatedLines: 400,
      },
      {
        name: 'NotificationTemplateService',
        responsibility: 'Manage notification templates and formatting',
        estimatedLines: 300,
      },
      {
        name: 'NotificationSchedulingService',
        responsibility: 'Handle scheduled and batch notifications',
        estimatedLines: 300,
      },
      {
        name: 'NotificationPreferencesService',
        responsibility: 'Manage user notification preferences',
        estimatedLines: 200,
      },
    ],
  },
  {
    serviceName: 'PreAssessmentChatbotService',
    currentLines: 1514,
    recommendedSplits: [
      {
        name: 'ChatbotConversationService',
        responsibility: 'Manage conversation flow and state',
        estimatedLines: 400,
      },
      {
        name: 'ChatbotAIService',
        responsibility: 'Handle AI model interactions',
        estimatedLines: 300,
      },
      {
        name: 'ChatbotResponseService',
        responsibility: 'Format and structure responses',
        estimatedLines: 300,
      },
    ],
  },
  {
    serviceName: 'MeetingsService',
    currentLines: 1362,
    recommendedSplits: [
      {
        name: 'MeetingRoomService',
        responsibility: 'Manage WebRTC meeting rooms',
        estimatedLines: 400,
      },
      {
        name: 'MeetingRecordingService',
        responsibility: 'Handle meeting recordings',
        estimatedLines: 300,
      },
      {
        name: 'MeetingNotificationService',
        responsibility: 'Send meeting-related notifications',
        estimatedLines: 200,
      },
    ],
  },
  {
    serviceName: 'MessagingService',
    currentLines: 1196,
    recommendedSplits: [
      {
        name: 'MessageDeliveryService',
        responsibility: 'Handle message delivery and retry logic',
        estimatedLines: 300,
      },
      {
        name: 'MessageEncryptionService',
        responsibility: 'Handle message encryption/decryption',
        estimatedLines: 200,
      },
      {
        name: 'ConversationService',
        responsibility: 'Manage conversation metadata and participants',
        estimatedLines: 300,
      },
    ],
  },
  {
    serviceName: 'EmailService',
    currentLines: 1077,
    recommendedSplits: [
      {
        name: 'EmailTemplateService',
        responsibility: 'Manage email templates',
        estimatedLines: 300,
      },
      {
        name: 'EmailQueueService',
        responsibility: 'Handle email queuing and retry logic',
        estimatedLines: 300,
      },
    ],
  },
  {
    serviceName: 'BookingService',
    currentLines: 1037,
    recommendedSplits: [
      {
        name: 'AvailabilityService',
        responsibility: 'Manage therapist availability and slots',
        estimatedLines: 300,
      },
      {
        name: 'BookingValidationService',
        responsibility: 'Validate booking requests',
        estimatedLines: 200,
      },
    ],
  },
];

/**
 * Helper to identify methods that should be extracted
 */
export function identifyExtractableMethods(
  serviceCode: string,
): Array<{ methodName: string; lineCount: number; complexity: 'low' | 'medium' | 'high' }> {
  // This is a placeholder - in practice, you'd use AST parsing
  // For now, return empty array as guidance
  return [];
}


