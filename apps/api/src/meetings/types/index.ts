/**
 * Meetings Module Types - Central exports for meeting types and DTOs
 */

// Export all meeting DTOs
export * from './meeting.dto';

// Re-export commonly used types for convenience
export type {
  CreateVideoRoomDto,
  JoinVideoRoomDto,
  EndVideoCallDto,
  UpdateMeetingStatusDto,
  SaveMeetingSessionDto,
  VideoRoomResponse,
  VideoCallStatus,
  MeetingResponseDto,
  MeetingQueryDto,
} from './meeting.dto';