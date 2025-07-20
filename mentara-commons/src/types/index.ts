// Type exports from schemas
export type {
  // User types
  UserRole,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  FirstSignInResponse,
  RolePermissions,
  RegisterClientDto,
  UpdateClientDto,
  // Note: RegisterTherapistDto and UpdateTherapistDto are now in therapist.ts
  DeactivateUserDto,
  UserDeactivationResponseDto
} from '../schemas/user';

export type {
  // Therapist types
  TherapistRecommendation,
  MatchCriteria,
  TherapistSearchParams,
  TherapistRecommendationResponse,
  TherapistDashboardData,
  PatientData,
  PersonalInfo,
  ProfessionalInfo,
  PracticeInfo,
  TherapistApplicationDto,
  TherapistApplication,
  ApplicationStatus,
  ApplicationDocument,
  ApplicationStatusUpdateDto,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationListParams,
  TherapistWorksheetAssignment,
  RegisterTherapistDto,
  UpdateTherapistDto,
  TherapistCredentials,
  SessionFormat,
  Education,
  Certification
} from '../schemas/therapist';

export type {
  // Booking types
  MeetingStatus,
  MeetingType,
  MeetingDuration,
  AvailableSlot,
  Meeting,
  MeetingClient,
  MeetingTherapist,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  BookingFormData,
  MeetingListParams,
  MeetingListResponse,
  Duration,
  TimeRange,
  ConflictResult,
  SlotGenerationConfig,
  TimeSlot,
  ValidationConfig,
  BookingStats
} from '../schemas/booking';

export type {
  // Review types
  ReviewStatus,
  Rating,
  Review,
  ReviewClient,
  ReviewTherapist,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewListParams,
  ReviewListResponse,
  ReviewStats,
  TherapistReviewParams,
  ModerateReviewRequest,
  ReviewHelpfulAction,
  ReviewReport,
  ReviewAnalytics,
  ReviewResponse,
  CreateReviewResponse
} from '../schemas/review';

export type {
  // Messaging types
  UserStatus,
  MessageStatus,
  MessageType,
  ConversationType,
  Attachment,
  Reaction,
  ReadReceipt,
  Message,
  BackendMessage,
  Contact,
  Conversation,
  MessageGroup,
  MessagesState,
  CreateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
  AddReactionDto,
  BlockUserDto,
  SearchMessagesDto,
  JoinConversationDto,
  LeaveConversationDto,
  TypingIndicatorDto,
  ConversationParticipant,
  BackendConversation,
  MessageSearchResult,
  ConversationListParams,
  MessageAnalytics,
  MessageNotificationPreferences
} from '../schemas/messaging';