// Mock Data Generator for Community Group Sessions

import {
  GroupSession,
  SessionType,
  SessionFormat,
  SessionStatus,
  SessionHost,
  SessionParticipant,
  RSVPStatus,
} from "@/types/api/sessions";
import { addDays, addHours, addMinutes, subDays, format } from "date-fns";

// Mock hosts
const mockHosts: SessionHost[] = [
  {
    id: "host-1",
    name: "Dr. Sarah Mitchell",
    role: "therapist",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    credentials: "Licensed Clinical Psychologist, PhD",
    bio: "Specializing in anxiety, depression, and mindfulness-based therapies with over 15 years of experience.",
  },
  {
    id: "host-2",
    name: "Dr. James Chen",
    role: "therapist",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
    credentials: "Licensed Therapist, LMFT",
    bio: "Expert in group therapy, trauma-informed care, and cognitive behavioral therapy.",
  },
  {
    id: "host-3",
    name: "Emily Rodriguez",
    role: "moderator",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    credentials: "Community Moderator, Peer Support Specialist",
    bio: "Passionate about creating safe spaces for mental health discussions and peer support.",
  },
  {
    id: "host-4",
    name: "Dr. Michael Thompson",
    role: "therapist",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    credentials: "Psychiatrist, MD",
    bio: "Specializing in mindfulness, meditation, and holistic mental wellness approaches.",
  },
  {
    id: "host-5",
    name: "Lisa Park",
    role: "moderator",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
    credentials: "Community Moderator, Certified Life Coach",
    bio: "Facilitating supportive discussions and community building for mental wellness.",
  },
];

// Generate mock participants
function generateMockParticipants(
  count: number,
  sessionId: string
): SessionParticipant[] {
  const participants: SessionParticipant[] = [];
  const firstNames = [
    "Alex",
    "Jordan",
    "Sam",
    "Taylor",
    "Morgan",
    "Casey",
    "Riley",
    "Avery",
    "Quinn",
    "Sage",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
  ];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    participants.push({
      id: `participant-${sessionId}-${i}`,
      userId: `user-${i}`,
      sessionId,
      status: "attending",
      joinedAt: subDays(
        new Date(),
        Math.floor(Math.random() * 30)
      ).toISOString(),
      user: {
        id: `user-${i}`,
        firstName,
        lastName,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${i}`,
      },
    });
  }

  return participants;
}

// Mock sessions data
export const mockSessions: GroupSession[] = [
  // Upcoming Virtual Session - Group Therapy
  {
    id: "session-1",
    title: "Anxiety Management Workshop",
    description:
      "Learn practical techniques to manage anxiety in daily life. This interactive workshop will cover breathing exercises, cognitive reframing, and mindfulness practices. Perfect for anyone struggling with anxious thoughts or panic symptoms.",
    type: "virtual",
    format: "workshop",
    startTime: addDays(new Date(), 2).toISOString(),
    endTime: addHours(addDays(new Date(), 2), 1.5).toISOString(),
    timezone: "America/New_York",
    duration: 90,
    maxParticipants: 20,
    currentParticipants: 15,
    waitlistCount: 3,
    meetingLink: "https://meet.mentara.app/anxiety-workshop",
    meetingPassword: "wellness123",
    host: mockHosts[0],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-1",
    roomName: "Support Groups",
    status: "upcoming",
    tags: ["anxiety", "coping-skills", "mindfulness", "beginner-friendly"],
    requiresApproval: false,
    isRecurring: false,
    participants: generateMockParticipants(15, "session-1"),
    waitlist: generateMockParticipants(3, "session-1-waitlist"),
    materials: [
      "https://mentara.app/resources/anxiety-workbook.pdf",
      "https://mentara.app/resources/breathing-guide.pdf",
    ],
    createdAt: subDays(new Date(), 14).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    userRSVP: "attending",
  },

  // Upcoming In-Person Session
  {
    id: "session-2",
    title: "Young Adults Support Circle",
    description:
      "A safe space for young adults (18-25) to share experiences, challenges, and victories. Meet others navigating similar life transitions, from college stress to career anxiety to relationship challenges.",
    type: "in-person",
    format: "support-circle",
    startTime: addDays(new Date(), 5).toISOString(),
    endTime: addHours(addDays(new Date(), 5), 2).toISOString(),
    timezone: "America/Los_Angeles",
    duration: 120,
    maxParticipants: 12,
    currentParticipants: 9,
    waitlistCount: 0,
    location: "Mentara Community Center, 123 Wellness St, Suite 200",
    host: mockHosts[2],
    coHosts: [mockHosts[4]],
    communityId: "community-2",
    communityName: "Young Adults Community",
    status: "upcoming",
    tags: ["young-adults", "peer-support", "life-transitions", "in-person"],
    requiresApproval: true,
    isRecurring: true,
    recurrencePattern: {
      frequency: "weekly",
      daysOfWeek: [5], // Friday
      endDate: addDays(new Date(), 90).toISOString(),
    },
    participants: generateMockParticipants(9, "session-2"),
    waitlist: [],
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
    userRSVP: "none",
  },

  // Today - Ongoing Session
  {
    id: "session-3",
    title: "Morning Meditation & Mindfulness",
    description:
      "Start your day with guided meditation and mindfulness practice. Open to all levels, from complete beginners to experienced meditators. Bring a calm, focused energy to your day.",
    type: "virtual",
    format: "meditation",
    startTime: addMinutes(new Date(), -15).toISOString(),
    endTime: addMinutes(new Date(), 30).toISOString(),
    timezone: "America/New_York",
    duration: 45,
    maxParticipants: 50,
    currentParticipants: 38,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/morning-meditation",
    host: mockHosts[3],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-3",
    roomName: "Mindfulness",
    status: "ongoing",
    tags: ["meditation", "mindfulness", "morning-routine", "all-levels"],
    requiresApproval: false,
    isRecurring: true,
    recurrencePattern: {
      frequency: "daily",
      daysOfWeek: [1, 2, 3, 4, 5], // Weekdays
    },
    participants: generateMockParticipants(38, "session-3"),
    waitlist: [],
    createdAt: subDays(new Date(), 60).toISOString(),
    updatedAt: new Date().toISOString(),
    userRSVP: "attending",
  },

  // Upcoming Hybrid Session
  {
    id: "session-4",
    title: "Coping Skills Training: CBT Fundamentals",
    description:
      "Learn Cognitive Behavioral Therapy (CBT) techniques to identify and challenge negative thought patterns. This evidence-based workshop includes practical exercises and take-home materials. Available both virtually and in-person.",
    type: "hybrid",
    format: "workshop",
    startTime: addDays(new Date(), 7).toISOString(),
    endTime: addHours(addDays(new Date(), 7), 2.5).toISOString(),
    timezone: "America/Chicago",
    duration: 150,
    maxParticipants: 25,
    currentParticipants: 18,
    waitlistCount: 2,
    location: "Wellness Center, 456 Hope Avenue",
    meetingLink: "https://meet.mentara.app/cbt-workshop",
    meetingPassword: "cbt2024",
    host: mockHosts[1],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-2",
    roomName: "Workshops",
    status: "upcoming",
    tags: ["cbt", "coping-skills", "evidence-based", "intermediate"],
    requiresApproval: false,
    isRecurring: false,
    participants: generateMockParticipants(18, "session-4"),
    waitlist: generateMockParticipants(2, "session-4-waitlist"),
    materials: [
      "https://mentara.app/resources/cbt-workbook.pdf",
      "https://mentara.app/resources/thought-records.pdf",
    ],
    createdAt: subDays(new Date(), 21).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
    userRSVP: "waitlist",
  },

  // Upcoming Social Session
  {
    id: "session-5",
    title: "Coffee & Connection: Casual Chat",
    description:
      "A relaxed, informal gathering for community members to connect over coffee (or tea!). No agenda, just good conversation and friendly faces. Perfect for making new friends in a low-pressure environment.",
    type: "in-person",
    format: "social",
    startTime: addDays(new Date(), 3).toISOString(),
    endTime: addHours(addDays(new Date(), 3), 1).toISOString(),
    timezone: "America/New_York",
    duration: 60,
    maxParticipants: 15,
    currentParticipants: 11,
    waitlistCount: 0,
    location: "Serenity Café, 789 Calm Street",
    host: mockHosts[4],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    status: "upcoming",
    tags: ["social", "networking", "casual", "coffee"],
    requiresApproval: false,
    isRecurring: true,
    recurrencePattern: {
      frequency: "biweekly",
      daysOfWeek: [6], // Saturday
    },
    participants: generateMockParticipants(11, "session-5"),
    waitlist: [],
    createdAt: subDays(new Date(), 45).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    userRSVP: "declined",
  },

  // Completed Session with Recording
  {
    id: "session-6",
    title: "Understanding Depression: Info Session",
    description:
      "Educational webinar on understanding depression, its symptoms, treatment options, and coping strategies. Q&A session included.",
    type: "virtual",
    format: "webinar",
    startTime: subDays(new Date(), 5).toISOString(),
    endTime: addHours(subDays(new Date(), 5), 1).toISOString(),
    timezone: "America/New_York",
    duration: 60,
    maxParticipants: 100,
    currentParticipants: 87,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/depression-webinar",
    host: mockHosts[0],
    coHosts: [mockHosts[1]],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-2",
    roomName: "Workshops",
    status: "completed",
    tags: ["depression", "education", "webinar", "mental-health"],
    requiresApproval: false,
    isRecurring: false,
    participants: generateMockParticipants(87, "session-6"),
    waitlist: [],
    recordingUrl: "https://mentara.app/recordings/depression-webinar-2024",
    notes:
      "Great turnout! Over 85 participants. Covered symptoms, treatment options, and self-care strategies. Q&A was particularly engaging.",
    materials: [
      "https://mentara.app/resources/depression-guide.pdf",
      "https://mentara.app/resources/self-care-checklist.pdf",
    ],
    createdAt: subDays(new Date(), 20).toISOString(),
    updatedAt: subDays(new Date(), 4).toISOString(),
    userRSVP: "attending",
  },

  // Upcoming - Limited Spots
  {
    id: "session-7",
    title: "ADHD Support Group",
    description:
      "Support group for adults living with ADHD. Share strategies, challenges, and wins. Topics include time management, focus techniques, and navigating daily life with ADHD.",
    type: "virtual",
    format: "support-circle",
    startTime: addDays(new Date(), 1).toISOString(),
    endTime: addHours(addDays(new Date(), 1), 1.5).toISOString(),
    timezone: "America/Los_Angeles",
    duration: 90,
    maxParticipants: 10,
    currentParticipants: 10,
    waitlistCount: 5,
    meetingLink: "https://meet.mentara.app/adhd-support",
    meetingPassword: "focus123",
    host: mockHosts[2],
    communityId: "community-3",
    communityName: "Neurodivergent Community",
    status: "upcoming",
    tags: ["adhd", "neurodivergent", "support-group", "small-group"],
    requiresApproval: true,
    isRecurring: true,
    recurrencePattern: {
      frequency: "weekly",
      daysOfWeek: [3], // Wednesday
    },
    participants: generateMockParticipants(10, "session-7"),
    waitlist: generateMockParticipants(5, "session-7-waitlist"),
    createdAt: subDays(new Date(), 40).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    userRSVP: "waitlist",
  },

  // Cancelled Session
  {
    id: "session-8",
    title: "Stress Management Workshop",
    description:
      "Workshop on stress management techniques. (Cancelled due to host illness - will be rescheduled)",
    type: "virtual",
    format: "workshop",
    startTime: addDays(new Date(), 1).toISOString(),
    endTime: addHours(addDays(new Date(), 1), 2).toISOString(),
    timezone: "America/New_York",
    duration: 120,
    maxParticipants: 30,
    currentParticipants: 0,
    waitlistCount: 0,
    host: mockHosts[1],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    status: "cancelled",
    tags: ["stress", "workshop", "cancelled"],
    requiresApproval: false,
    isRecurring: false,
    participants: [],
    waitlist: [],
    notes: "Cancelled due to host illness. Will reschedule for next month.",
    createdAt: subDays(new Date(), 10).toISOString(),
    updatedAt: new Date().toISOString(),
    userRSVP: "none",
  },
];

// Helper functions to filter sessions
export function getUpcomingSessions(communityId?: string): GroupSession[] {
  let sessions = mockSessions.filter((s) => s.status === "upcoming");
  if (communityId) {
    sessions = sessions.filter((s) => s.communityId === communityId);
  }
  return sessions.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

export function getOngoingSessions(communityId?: string): GroupSession[] {
  let sessions = mockSessions.filter((s) => s.status === "ongoing");
  if (communityId) {
    sessions = sessions.filter((s) => s.communityId === communityId);
  }
  return sessions;
}

export function getCompletedSessions(communityId?: string): GroupSession[] {
  let sessions = mockSessions.filter((s) => s.status === "completed");
  if (communityId) {
    sessions = sessions.filter((s) => s.communityId === communityId);
  }
  return sessions.sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

export function getUserSessions(
  userId: string,
  status?: SessionStatus
): GroupSession[] {
  return mockSessions.filter((session) => {
    const isParticipant = session.participants.some((p) => p.userId === userId);
    const statusMatch = !status || session.status === status;
    return isParticipant && statusMatch;
  });
}

export function getSessionById(sessionId: string): GroupSession | undefined {
  return mockSessions.find((s) => s.id === sessionId);
}

// Mock function to simulate RSVP
export function mockRSVPToSession(
  sessionId: string,
  status: "join" | "leave"
): { success: boolean; message: string } {
  const session = mockSessions.find((s) => s.id === sessionId);

  if (!session) {
    return { success: false, message: "Session not found" };
  }

  if (status === "join") {
    if (session.currentParticipants >= session.maxParticipants) {
      session.waitlistCount++;
      session.userRSVP = "waitlist";
      return { success: true, message: "Added to waitlist" };
    }
    session.currentParticipants++;
    session.userRSVP = "attending";
    return { success: true, message: "Successfully joined session" };
  } else {
    if (session.userRSVP === "attending") {
      session.currentParticipants--;
    } else if (session.userRSVP === "waitlist") {
      session.waitlistCount--;
    }
    session.userRSVP = "none";
    return { success: true, message: "Successfully left session" };
  }
}
