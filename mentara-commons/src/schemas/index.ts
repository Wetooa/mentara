// Explicit exports for user and review schemas (verified)
export {
  UserRoleSchema,
  UserSchema,
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  FirstSignInResponseSchema,
  RolePermissionsSchema,
  RegisterClientDtoSchema,
  UpdateClientDtoSchema,
  DeactivateUserDtoSchema,
  UserDeactivationResponseDtoSchema,
  RegisterAdminDtoSchema,
  RegisterModeratorDtoSchema,
  LoginDtoSchema,
  RefreshTokenDtoSchema,
  ChangePasswordDtoSchema,
  RegisterUserDtoSchema,
  LogoutDtoSchema,
  UserIdParamSchema,
  RequestPasswordResetDtoSchema,
  ResetPasswordDtoSchema,
  SendVerificationEmailDtoSchema,
  ResendVerificationEmailDtoSchema,
  VerifyEmailDtoSchema,
  UserIdSchema,
  EmailSchema,
  type UserRole,
  type User,
  type CreateUserRequest,
  type UpdateUserRequest,
  type FirstSignInResponse,
  type RolePermissions,
  type RegisterClientDto,
  type UpdateClientDto,
  type DeactivateUserDto,
  type UserDeactivationResponseDto,
  type RegisterAdminDto,
  type RegisterModeratorDto,
  type RegisterUserDto,
  type LogoutDto,
  type LoginDto,
  type RefreshTokenDto,
  type ChangePasswordDto,
  type UserIdParam,
  type RequestPasswordResetDto,
  type ResetPasswordDto,
  type SendVerificationEmailDto,
  type ResendVerificationEmailDto,
  type VerifyEmailDto
} from './user';

export {
  ReviewStatusSchema,
  RatingSchema,
  ReviewClientSchema,
  ReviewTherapistSchema,
  ReviewSchema,
  CreateReviewRequestSchema,
  UpdateReviewRequestSchema,
  ReviewListParamsSchema,
  ReviewListResponseSchema,
  ReviewStatsSchema,
  CreateReviewDtoSchema,
  UpdateReviewDtoSchema,
  ModerateReviewDtoSchema,
  GetReviewsDtoSchema,
  TherapistReviewParamsSchema,
  ReviewReportSchema,
  ModerateReviewRequestSchema,
  ReviewHelpfulActionSchema,
  ReviewAnalyticsSchema,
  ReviewResponseSchema,
  CreateReviewResponseSchema,
  ReviewIdParamSchema,
  type ReviewStatus,
  type Rating,
  type ReviewClient,
  type ReviewTherapist,
  type Review,
  type CreateReviewRequest,
  type UpdateReviewRequest,
  type ReviewListParams,
  type ReviewListResponse,
  type ReviewStats,
  type CreateReviewDto,
  type UpdateReviewDto,
  type ModerateReviewDto,
  type GetReviewsDto,
  type TherapistReviewParams,
  type ReviewReport,
  type ModerateReviewRequest,
  type ReviewHelpfulAction,
  type ReviewAnalytics,
  type ReviewResponse,
  type CreateReviewResponse,
  type ReviewIdParam
} from './review';

export {
  MeetingStatusSchema,
  MeetingTypeSchema,
  MeetingDurationSchema,
  AvailableSlotSchema,
  MeetingClientSchema,
  MeetingTherapistSchema,
  MeetingSchema,
  CreateMeetingRequestSchema,
  UpdateMeetingRequestSchema,
  BookingFormDataSchema,
  MeetingListParamsSchema,
  MeetingListResponseSchema,
  DurationSchema,
  TimeRangeSchema,
  ConflictResultSchema,
  SlotGenerationConfigSchema,
  TimeSlotSchema,
  ValidationConfigSchema,
  BookingStatsSchema,
  MeetingCreateDtoSchema,
  MeetingUpdateDtoSchema,
  BookingMeetingParamsDtoSchema,
  TherapistAvailabilityCreateDtoSchema,
  TherapistAvailabilityUpdateDtoSchema,
  AvailabilityParamsDtoSchema,
  GetAvailableSlotsQueryDtoSchema,
  type MeetingStatus,
  type MeetingType,
  type MeetingDuration,
  type AvailableSlot,
  type Meeting,
  type MeetingClient,
  type MeetingTherapist,
  type CreateMeetingRequest,
  type UpdateMeetingRequest,
  type BookingFormData,
  type MeetingListParams,
  type MeetingListResponse,
  type Duration,
  type TimeRange,
  type ConflictResult,
  type SlotGenerationConfig,
  type TimeSlot,
  type ValidationConfig,
  type BookingStats,
  type MeetingCreateDto,
  type MeetingUpdateDto,
  type BookingMeetingParamsDto,
  type TherapistAvailabilityCreateDto,
  type TherapistAvailabilityUpdateDto,
  type AvailabilityParamsDto,
  type GetAvailableSlotsQueryDto
} from './booking';

export {
  SessionMeetingSchema,
  CreateVideoRoomDtoSchema,
  JoinVideoRoomDtoSchema,
  EndVideoCallDtoSchema,
  VideoRoomResponseSchema,
  VideoCallStatusSchema,
  UpdateMeetingStatusDtoSchema,
  SaveMeetingSessionDtoSchema,
  type SessionMeeting,
  type CreateVideoRoomDto,
  type JoinVideoRoomDto,
  type EndVideoCallDto,
  type VideoRoomResponse,
  type VideoCallStatus,
  type UpdateMeetingStatusDto,
  type SaveMeetingSessionDto
} from './meetings';

// Star exports for schemas that need verification (TODO: convert to explicit later)
export * from './messaging';
export * from './analytics';
export * from './audit-logs';
export * from './billing';
export * from './client-therapist-requests';
export * from './communities';
export * from './files';
export * from './notifications';
export * from './onboarding';
export * from './sessions';
export * from './worksheets';
export * from './pre-assessment';
export * from './push-notifications';
export * from './client';
export * from './comments';
export * from './posts';
export * from './admin';
export * from './moderator';
export * from './therapist';
export * from './search';

// Re-export zod for convenience
export { z } from 'zod';