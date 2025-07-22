import type {
  ApiDashboardResponse,
  UserDashboardData,
} from "@/types/api/dashboard";

/**
 * Transform backend dashboard response to frontend UserDashboardData format
 */
export function transformDashboardData(
  backendData: ApiDashboardResponse,
  notifications: unknown[] = [],
  recentCommunications: unknown[] = []
): UserDashboardData {
  console.log('🔍 Starting dashboard data transformation...');
  console.log('🔍 Backend data keys:', Object.keys(backendData || {}));
  
  const {
    client,
    stats,
    upcomingMeetings,
    pendingWorksheets,
    assignedTherapists,
  } = backendData;

  // DEBUG: Log each section of data
  console.log('🔍 Client data:', client);
  console.log('🔍 Stats data:', stats);
  console.log('🔍 Upcoming meetings data:', upcomingMeetings);
  console.log('🔍 Pending worksheets data:', pendingWorksheets);
  console.log('🔍 Notifications data:', notifications);
  console.log('🔍 Communications data:', recentCommunications);

  // Handle cases where client.user might be null or undefined
  if (!client?.user) {
    console.warn("Client user data is missing, using fallback data");
    return createFallbackDashboardData(client?.userId || "unknown");
  }

  return {
    user: {
      id: client.user.id,
      name:
        `${client.user.firstName || ""} ${client.user.lastName || ""}`.trim() ||
        "User",
      avatar:
        client.user.avatarUrl || client.user.imageUrl || "/default-avatar.jpg",
      email: client.user.email,
      joinDate: safeDateTimeFormat(client.user.createdAt),
    },
    stats: {
      completedSessions: stats.completedMeetings,
      upcomingSessions: stats.upcomingMeetings,
      completedWorksheets: stats.completedWorksheets,
      pendingWorksheets: stats.pendingWorksheets,
      therapistsConsulted: assignedTherapists.length,
    },
    progress: {
      // Note: Backend doesn't provide this data yet, using placeholders
      // TODO: Implement progress tracking in backend
      weeklyMood: [
        {
          date: formatDateSafely(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
          value: 3,
        },
        {
          date: formatDateSafely(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
          value: 3,
        },
        {
          date: formatDateSafely(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
          value: 4,
        },
        {
          date: formatDateSafely(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
          value: 2,
        },
        {
          date: formatDateSafely(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
          value: 3,
        },
        {
          date: formatDateSafely(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
          value: 4,
        },
        { date: formatDateSafely(new Date()), value: 4 },
      ],
      treatmentProgress: Math.min(
        100,
        stats.completedMeetings * 10 + stats.completedWorksheets * 5
      ), // Calculated progress
      weeklyEngagement: Math.min(
        100,
        Math.max(
          0,
          60 + stats.upcomingMeetings * 10 + stats.pendingWorksheets * 5
        )
      ), // Calculated engagement
    },
    upcomingSessions: upcomingMeetings.map((meeting, index) => {
      console.log(`🔍 Processing meeting ${index}:`, meeting);
      console.log(`🔍 Meeting startTime type/value:`, typeof meeting.startTime, meeting.startTime);
      
      return {
        id: meeting.id,
        title: meeting.title || "Therapy Session",
        therapistId: meeting.therapist?.userId || "",
        therapistName:
          `${meeting.therapist?.user?.firstName || ""} ${meeting.therapist?.user?.lastName || ""}`.trim() ||
          "Therapist",
        therapistAvatar: undefined, // Backend doesn't provide this yet
        dateTime: safeDateTimeFormat(meeting.startTime),
        duration: meeting.duration,
        status: transformMeetingStatus(meeting.status),
        joinUrl: `/session/join/${meeting.id}`,
      };
    }),
    worksheets: pendingWorksheets.map((worksheet, index) => {
      console.log(`🔍 Processing worksheet ${index}:`, worksheet);
      console.log(`🔍 Worksheet dates:`, {
        assignedDate: worksheet.assignedDate,
        dueDate: worksheet.dueDate,
        assignedDateType: typeof worksheet.assignedDate,
        dueDateType: typeof worksheet.dueDate
      });
      
      return {
        id: worksheet.id,
        title: worksheet.title,
        assignedDate: safeDateTimeFormat(worksheet.assignedDate),
        dueDate: worksheet.dueDate
          ? safeDateTimeFormat(worksheet.dueDate)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
        status: worksheet.isCompleted
          ? "completed"
          : determineWorksheetStatus(worksheet.dueDate),
        progress: worksheet.progress || 0,
        therapistName:
          `${worksheet.therapist?.user?.firstName || ""} ${worksheet.therapist?.user?.lastName || ""}`.trim() ||
          "Therapist",
      };
    }),
    notifications: notifications.map((notification, index) => {
      console.log(`🔍 Processing notification ${index}:`, notification);
      console.log(`🔍 Notification dates:`, {
        createdAt: notification.createdAt,
        dateTime: notification.dateTime,
        createdAtType: typeof notification.createdAt,
        dateTimeType: typeof notification.dateTime
      });
      
      return {
        id: notification.id,
        type: transformNotificationType(notification.type),
        title: notification.title,
        message: notification.message,
        dateTime: safeDateTimeFormat(notification.createdAt || notification.dateTime),
        read: notification.read || notification.isRead || false,
        actionUrl: notification.actionUrl,
      };
    }),
    recentCommunications: recentCommunications.slice(0, 4).map((comm, index) => {
      console.log(`🔍 Processing communication ${index}:`, comm);
      console.log(`🔍 Communication time fields:`, {
        time: comm.time,
        lastMessageTime: comm.lastMessageTime,
        updatedAt: comm.updatedAt,
        timeType: typeof comm.time,
        lastMessageTimeType: typeof comm.lastMessageTime,
        updatedAtType: typeof comm.updatedAt
      });
      
      return {
        id: comm.id,
        name:
          comm.name ||
          `${comm.user?.firstName || ""} ${comm.user?.lastName || ""}`.trim() ||
          "Contact",
        status: comm.status || "offline",
        lastMessage:
          comm.lastMessage || comm.lastMessageContent || "No messages yet",
        time: safeDateTimeFormat(comm.time || comm.lastMessageTime || comm.updatedAt),
        unread: comm.unread || comm.unreadCount || 0,
        avatar:
          comm.avatar ||
          comm.user?.avatarUrl ||
          comm.user?.imageUrl ||
          "/default-avatar.jpg",
      };
    }),
  };
}

/**
 * Transform backend meeting status to frontend format
 */
function transformMeetingStatus(
  backendStatus: string
): "scheduled" | "started" | "completed" | "cancelled" {
  const statusMap: Record<
    string,
    "scheduled" | "started" | "completed" | "cancelled"
  > = {
    SCHEDULED: "scheduled",
    CONFIRMED: "scheduled",
    STARTED: "started",
    IN_PROGRESS: "started",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    CANCELED: "cancelled",
  };

  return statusMap[backendStatus.toUpperCase()] || "scheduled";
}

/**
 * Determine worksheet status based on due date
 */
function determineWorksheetStatus(
  dueDate?: string
): "completed" | "pending" | "overdue" {
  if (!dueDate) return "pending";

  const due = new Date(dueDate);
  const now = new Date();

  if (due < now) {
    return "overdue";
  }

  return "pending";
}

/**
 * Transform backend notification type to frontend format
 */
function transformNotificationType(
  backendType: string
): "session" | "worksheet" | "message" | "system" {
  const typeMap: Record<
    string,
    "session" | "worksheet" | "message" | "system"
  > = {
    appointment: "session",
    meeting: "session",
    session: "session",
    worksheet: "worksheet",
    assignment: "worksheet",
    message: "message",
    chat: "message",
    system: "system",
    admin: "system",
    notification: "system",
  };

  return typeMap[backendType.toLowerCase()] || "system";
}

/**
 * Safely format a date to YYYY-MM-DD format
 */
function formatDateSafely(date: Date): string {
  try {
    if (!date || isNaN(date.getTime())) {
      const fallbackIso = new Date().toISOString();
      return fallbackIso ? fallbackIso.split("T")[0] : new Date().toISOString().substring(0, 10);
    }
    const isoString = date.toISOString();
    return isoString && isoString.includes("T") ? isoString.split("T")[0] : new Date().toISOString().substring(0, 10);
  } catch (error) {
    console.warn("Error formatting date:", error);
    const fallbackIso = new Date().toISOString();
    return fallbackIso ? fallbackIso.split("T")[0] : new Date().toISOString().substring(0, 10);
  }
}

/**
 * Safely parse and format dateTime strings to avoid split errors
 */
function safeDateTimeFormat(dateTime: any): string {
  if (!dateTime) return new Date().toISOString();
  
  try {
    if (typeof dateTime === 'string') {
      // Ensure the string is valid before processing
      if (dateTime.trim() === '') return new Date().toISOString();
      return dateTime;
    }
    if (dateTime instanceof Date) {
      return dateTime.toISOString();
    }
    // Fallback for other types
    return new Date(dateTime).toISOString();
  } catch (error) {
    console.warn('Error formatting dateTime:', error, 'Input:', dateTime);
    return new Date().toISOString();
  }
}

/**
 * Fallback data for when backend data is unavailable
 */
export function createFallbackDashboardData(
  userId: string = "unknown"
): UserDashboardData {
  return {
    user: {
      id: userId,
      name: "User",
      avatar: "/default-avatar.jpg",
      email: "user@example.com",
      joinDate: new Date().toISOString(),
    },
    stats: {
      completedSessions: 0,
      upcomingSessions: 0,
      completedWorksheets: 0,
      pendingWorksheets: 0,
      therapistsConsulted: 0,
    },
    progress: {
      weeklyMood: [],
      treatmentProgress: 0,
      weeklyEngagement: 0,
    },
    upcomingSessions: [],
    worksheets: [],
    notifications: [],
    recentCommunications: [],
  };
}
