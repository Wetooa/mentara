// Comprehensive filter and parameter types for all API services
// This eliminates the need for Record<string, any> in queryKeys

// ====================
// USER FILTERS
// ====================
interface UserListFilters {
  role?: 'client' | 'therapist' | 'moderator' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// THERAPIST FILTERS
// ====================
interface TherapistListFilters {
  specialties?: string[];
  province?: string;
  minRating?: number;
  maxHourlyRate?: number;
  includeInactive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'rating' | 'hourlyRate' | 'experience';
  sortOrder?: 'asc' | 'desc';
}

interface TherapistRecommendationParams {
  limit?: number;
  includeInactive?: boolean;
  province?: string;
  maxHourlyRate?: number;
  specialties?: string[];
  minRating?: number;
  offset?: number;
}

interface TherapistApplicationFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'under_review';
  limit?: number;
  offset?: number;
  sortBy?: 'submissionDate' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// COMMUNITY FILTERS
// ====================
interface CommunityListFilters {
  category?: string;
  isPublic?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'memberCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// POST FILTERS
// ====================
interface PostListFilters {
  roomId?: string;
  authorId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'hearts' | 'comments';
  sortOrder?: 'asc' | 'desc';
  isAnonymous?: boolean;
}

// ====================
// COMMENT FILTERS
// ====================
interface CommentListFilters {
  postId?: string;
  authorId?: string;
  parentId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'hearts';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// REVIEW FILTERS
// ====================
interface ReviewListFilters {
  therapistId?: string;
  rating?: number;
  verified?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// BOOKING FILTERS
// ====================
interface BookingListFilters {
  therapistId?: string;
  clientId?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'scheduledAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// FILE FILTERS
// ====================
interface FileListFilters {
  uploadedBy?: string;
  fileType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'uploadedAt' | 'fileName' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// NOTIFICATION FILTERS
// ====================
interface NotificationListFilters {
  type?: string;
  read?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// ANALYTICS FILTERS
// ====================
interface AnalyticsTimeRange {
  startDate: string;
  endDate: string;
  period: 'day' | 'week' | 'month' | 'year';
}

interface AnalyticsQueryParams {
  timeRange?: AnalyticsTimeRange;
  metrics?: string[];
  filters?: {
    userRole?: 'client' | 'therapist' | 'moderator' | 'admin';
    therapistId?: string;
    clientId?: string;
    communityId?: string;
    sessionType?: string;
    status?: string;
  };
  groupBy?: 'day' | 'week' | 'month' | 'year';
  limit?: number;
  offset?: number;
}

// ====================
// SEARCH FILTERS
// ====================
interface TherapistSearchFilters {
  specialties?: string[];
  languages?: string[];
  minExperience?: number;
  maxExperience?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  availableFrom?: string;
  availableTo?: string;
}

interface PostSearchFilters {
  communityId?: string;
  roomId?: string;
  authorId?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}

interface UserSearchFilters {
  role?: 'client' | 'therapist' | 'moderator' | 'admin';
  isActive?: boolean;
}

interface CommunitySearchFilters {
  category?: string;
  isPublic?: boolean;
}

interface GlobalSearchFilters {
  type?: 'therapists' | 'posts' | 'communities' | 'users';
}

// ====================
// SESSION FILTERS
// ====================
interface SessionListFilters {
  clientId?: string;
  therapistId?: string;
  sessionType?: 'initial' | 'regular' | 'followup' | 'final';
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'sessionNumber' | 'createdAt' | 'completedAt';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// MESSAGING FILTERS
// ====================
interface ConversationListFilters {
  type?: 'direct' | 'group';
  participantId?: string;
  hasUnread?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'lastActivity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface MessageListFilters {
  conversationId?: string;
  senderId?: string;
  messageType?: 'text' | 'image' | 'file';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'sentAt';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// PRE-ASSESSMENT FILTERS
// ====================
interface PreAssessmentFilters {
  userId?: string;
  status?: 'completed' | 'in_progress' | 'abandoned';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'completedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// AUDIT LOG FILTERS
// ====================
interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  category?: 'auth' | 'user' | 'session' | 'community' | 'admin' | 'security' | 'payment' | 'system';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  success?: boolean;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'action' | 'user' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// WORKSHEET FILTERS
// ====================
interface WorksheetListFilters {
  assignedTo?: string;
  assignedBy?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
  category?: string;
  dueDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'dueDate' | 'assignedAt' | 'completedAt';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// BILLING FILTERS  
// ====================
interface BillingPlanFilters {
  type?: 'free' | 'basic' | 'premium' | 'enterprise';
  active?: boolean;
  billingCycle?: 'monthly' | 'yearly';
}

interface InvoiceFilters {
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'dueDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// ADMIN FILTERS
// ====================
interface AdminUserFilters {
  role?: 'client' | 'therapist' | 'moderator' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

// ====================
// EXPORT UNION TYPES FOR FLEXIBILITY
// ====================
type AnyListFilters = 
  | UserListFilters
  | TherapistListFilters
  | CommunityListFilters
  | PostListFilters
  | CommentListFilters
  | ReviewListFilters
  | BookingListFilters
  | FileListFilters
  | NotificationListFilters
  | SessionListFilters
  | WorksheetListFilters
  | InvoiceFilters;

type AnySearchFilters =
  | TherapistSearchFilters
  | PostSearchFilters
  | UserSearchFilters
  | CommunitySearchFilters
  | GlobalSearchFilters;