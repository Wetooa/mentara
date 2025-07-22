/**
 * Application-wide enums and constants
 */

// User roles
export enum UserRole {
  CLIENT = 'client',
  THERAPIST = 'therapist',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

// Meeting statuses
export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
}

// Meeting types
export enum MeetingType {
  INITIAL_CONSULTATION = 'initial_consultation',
  THERAPY_SESSION = 'therapy_session',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
}

// Review status
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

// Therapist application status
export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  INCOMPLETE = 'incomplete',
}

// Message types
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

// Message status  
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

// User online status
export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  BUSY = 'busy',
}

// Conversation types
export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  THERAPY_SESSION = 'therapy_session',
}

// OTP types
export enum OtpType {
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
  LOGIN_VERIFICATION = 'login_verification',
}

// Session formats for therapists
export enum SessionFormat {
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call',
  PHONE_CALL = 'phone_call',
  CHAT = 'chat',
  HYBRID = 'hybrid',
}

// Worksheet statuses
export enum WorksheetStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

// Notification types
export enum NotificationType {
  MESSAGE = 'message',
  MEETING_REMINDER = 'meeting_reminder',
  ASSIGNMENT = 'assignment',
  SYSTEM = 'system',
}