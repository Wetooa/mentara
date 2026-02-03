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
enum MeetingStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
}

// Meeting types
enum MeetingType {
  INITIAL_CONSULTATION = 'initial_consultation',
  THERAPY_SESSION = 'therapy_session',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
}

// Review status
enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

// Therapist application status
enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  INCOMPLETE = 'incomplete',
}

// Message types
enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

// Message status
enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

// User online status
enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  BUSY = 'busy',
}

// Conversation types
enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  THERAPY_SESSION = 'therapy_session',
}

// OTP types
enum OtpType {
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
  LOGIN_VERIFICATION = 'login_verification',
}

// Session formats for therapists
enum SessionFormat {
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call',
  PHONE_CALL = 'phone_call',
  CHAT = 'chat',
  HYBRID = 'hybrid',
}

// Worksheet statuses
enum WorksheetStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

// Notification types
enum NotificationType {
  MESSAGE = 'message',
  MEETING_REMINDER = 'meeting_reminder',
  ASSIGNMENT = 'assignment',
  SYSTEM = 'system',
}
