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

  // Past Completed Session - Virtual Support Circle
  {
    id: "session-9",
    title: "Evening Support Circle: Anxiety & Coping",
    description:
      "A weekly support circle where members share their experiences with anxiety and discuss coping strategies that work for them.",
    type: "virtual",
    format: "support-circle",
    startTime: subDays(new Date(), 3).toISOString(),
    endTime: addHours(subDays(new Date(), 3), 1.5).toISOString(),
    timezone: "America/New_York",
    duration: 90,
    maxParticipants: 15,
    currentParticipants: 13,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/evening-support",
    host: mockHosts[2],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-1",
    roomName: "Support Groups",
    status: "completed",
    tags: ["anxiety", "support-group", "peer-support", "evening"],
    requiresApproval: false,
    isRecurring: true,
    recurrencePattern: {
      frequency: "weekly",
      daysOfWeek: [2], // Tuesday
    },
    participants: generateMockParticipants(13, "session-9"),
    waitlist: [],
    recordingUrl: "https://mentara.app/recordings/evening-support-2024",
    notes:
      "Excellent session with meaningful discussions. Several members shared breakthrough moments.",
    createdAt: subDays(new Date(), 60).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
    userRSVP: "attending",
  },

  // Past Completed Session - Virtual Workshop
  {
    id: "session-10",
    title: "Sleep Hygiene & Insomnia Management",
    description:
      "Learn evidence-based techniques to improve sleep quality. Topics include sleep hygiene, cognitive behavioral therapy for insomnia (CBT-I), and relaxation techniques.",
    type: "virtual",
    format: "workshop",
    startTime: subDays(new Date(), 7).toISOString(),
    endTime: addHours(subDays(new Date(), 7), 2).toISOString(),
    timezone: "America/Los_Angeles",
    duration: 120,
    maxParticipants: 40,
    currentParticipants: 34,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/sleep-workshop",
    host: mockHosts[0],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-2",
    roomName: "Workshops",
    status: "completed",
    tags: ["sleep", "insomnia", "cbt", "sleep-hygiene"],
    requiresApproval: false,
    isRecurring: false,
    participants: generateMockParticipants(34, "session-10"),
    waitlist: [],
    recordingUrl: "https://mentara.app/recordings/sleep-workshop-2024",
    notes:
      "Highly informative session. Participants requested follow-up sessions on advanced sleep techniques.",
    materials: [
      "https://mentara.app/resources/sleep-hygiene-guide.pdf",
      "https://mentara.app/resources/sleep-diary-template.pdf",
      "https://mentara.app/resources/relaxation-exercises.pdf",
    ],
    createdAt: subDays(new Date(), 25).toISOString(),
    updatedAt: subDays(new Date(), 7).toISOString(),
    userRSVP: "none",
  },

  // Past Completed Session - In-Person Social
  {
    id: "session-11",
    title: "Art Therapy & Creative Expression",
    description:
      "Express yourself through art in a judgment-free environment. No artistic experience needed - just bring your creativity and open mind!",
    type: "in-person",
    format: "social",
    startTime: subDays(new Date(), 10).toISOString(),
    endTime: addHours(subDays(new Date(), 10), 2.5).toISOString(),
    timezone: "America/Chicago",
    duration: 150,
    maxParticipants: 20,
    currentParticipants: 18,
    waitlistCount: 0,
    location: "Community Art Studio, 321 Creative Lane",
    host: mockHosts[4],
    coHosts: [mockHosts[2]],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    status: "completed",
    tags: ["art-therapy", "creative", "in-person", "therapeutic"],
    requiresApproval: false,
    isRecurring: true,
    recurrencePattern: {
      frequency: "monthly",
    },
    participants: generateMockParticipants(18, "session-11"),
    waitlist: [],
    notes:
      "Beautiful session! Participants created amazing art and connected deeply. Many requested monthly sessions.",
    materials: [
      "https://mentara.app/resources/art-therapy-techniques.pdf",
    ],
    createdAt: subDays(new Date(), 35).toISOString(),
    updatedAt: subDays(new Date(), 10).toISOString(),
    userRSVP: "attending",
  },

  // Past Completed Session - Virtual Meditation
  {
    id: "session-12",
    title: "Guided Meditation for Stress Relief",
    description:
      "30-minute guided meditation session focused on releasing stress and tension. Perfect for beginners and experienced meditators alike.",
    type: "virtual",
    format: "meditation",
    startTime: subDays(new Date(), 2).toISOString(),
    endTime: addMinutes(subDays(new Date(), 2), 30).toISOString(),
    timezone: "America/New_York",
    duration: 30,
    maxParticipants: 100,
    currentParticipants: 67,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/guided-meditation",
    host: mockHosts[3],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-3",
    roomName: "Mindfulness",
    status: "completed",
    tags: ["meditation", "stress-relief", "mindfulness", "short-session"],
    requiresApproval: false,
    isRecurring: true,
    recurrencePattern: {
      frequency: "weekly",
      daysOfWeek: [4], // Thursday
    },
    participants: generateMockParticipants(67, "session-12"),
    waitlist: [],
    recordingUrl: "https://mentara.app/recordings/meditation-stress-relief",
    notes: "Peaceful and calming session. Many participants reported feeling significantly more relaxed.",
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
    userRSVP: "attending",
  },

  // Past Completed Session - Virtual Workshop
  {
    id: "session-13",
    title: "Building Resilience: Strategies for Tough Times",
    description:
      "Learn practical strategies to build emotional resilience and bounce back from difficult situations. Includes exercises and real-world applications.",
    type: "virtual",
    format: "workshop",
    startTime: subDays(new Date(), 14).toISOString(),
    endTime: addHours(subDays(new Date(), 14), 2).toISOString(),
    timezone: "America/Los_Angeles",
    duration: 120,
    maxParticipants: 30,
    currentParticipants: 26,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/resilience-workshop",
    host: mockHosts[1],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-2",
    roomName: "Workshops",
    status: "completed",
    tags: ["resilience", "coping-skills", "mental-strength", "workshop"],
    requiresApproval: false,
    isRecurring: false,
    participants: generateMockParticipants(26, "session-13"),
    waitlist: [],
    recordingUrl: "https://mentara.app/recordings/resilience-workshop-2024",
    notes:
      "Participants gained valuable tools for building mental resilience. High engagement throughout.",
    materials: [
      "https://mentara.app/resources/resilience-workbook.pdf",
      "https://mentara.app/resources/daily-resilience-practice.pdf",
    ],
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 14).toISOString(),
    userRSVP: "attending",
  },

  // Past Completed Session - Hybrid Group Therapy - OCD SUPPORT COMMUNITY
  {
    id: "session-14",
    title: "OCD Support Group: Managing Intrusive Thoughts",
    description:
      "Support group specifically for individuals living with OCD. Share experiences, learn from others, and practice techniques for managing intrusive thoughts and compulsions.",
    type: "hybrid",
    format: "group-therapy",
    startTime: subDays(new Date(), 6).toISOString(),
    endTime: addHours(subDays(new Date(), 6), 1.5).toISOString(),
    timezone: "America/New_York",
    duration: 90,
    maxParticipants: 12,
    currentParticipants: 11,
    waitlistCount: 0,
    location: "Wellness Center, 555 Peace Street, Room 3B",
    meetingLink: "https://meet.mentara.app/ocd-support",
    host: mockHosts[0],
    communityId: "a1124eaa-fa27-46e7-b32a-5dc7e446ee29", // REAL OCD Support Community ID
    communityName: "OCD Support Community",
    roomId: "5460e7ec-deeb-4fad-abe2-e84fcb0ed199", // General Discussion room
    roomName: "General Discussion",
    status: "completed",
    tags: ["ocd", "intrusive-thoughts", "support-group", "therapy"],
    requiresApproval: true,
    isRecurring: true,
    recurrencePattern: {
      frequency: "weekly",
      daysOfWeek: [1], // Monday
    },
    participants: generateMockParticipants(11, "session-14"),
    waitlist: [],
    notes:
      "Productive session with great peer support. Members shared helpful strategies for managing compulsions.",
    materials: [
      "https://mentara.app/resources/ocd-management-guide.pdf",
      "https://mentara.app/resources/exposure-response-prevention.pdf",
    ],
    createdAt: subDays(new Date(), 90).toISOString(),
    updatedAt: subDays(new Date(), 6).toISOString(),
    userRSVP: "attending",
  },

  // Upcoming Session - OCD SUPPORT COMMUNITY
  {
    id: "session-21",
    title: "Exposure & Response Prevention (ERP) Workshop",
    description:
      "Learn and practice ERP techniques with a licensed therapist. This evidence-based approach is the gold standard for OCD treatment. Includes guided exercises and homework planning.",
    type: "virtual",
    format: "workshop",
    startTime: addDays(new Date(), 4).toISOString(),
    endTime: addHours(addDays(new Date(), 4), 2).toISOString(),
    timezone: "America/New_York",
    duration: 120,
    maxParticipants: 20,
    currentParticipants: 14,
    waitlistCount: 2,
    meetingLink: "https://meet.mentara.app/erp-workshop",
    meetingPassword: "ocd2024",
    host: mockHosts[0],
    communityId: "a1124eaa-fa27-46e7-b32a-5dc7e446ee29", // REAL OCD Support Community ID
    communityName: "OCD Support Community",
    roomId: "5460e7ec-deeb-4fad-abe2-e84fcb0ed199",
    roomName: "General Discussion",
    status: "upcoming",
    tags: ["ocd", "erp", "exposure-therapy", "evidence-based", "workshop"],
    requiresApproval: false,
    isRecurring: false,
    participants: generateMockParticipants(14, "session-21"),
    waitlist: generateMockParticipants(2, "session-21-waitlist"),
    materials: [
      "https://mentara.app/resources/erp-guide.pdf",
      "https://mentara.app/resources/exposure-hierarchy.pdf",
    ],
    createdAt: subDays(new Date(), 15).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    userRSVP: "attending",
  },

  // Upcoming Session - OCD SUPPORT COMMUNITY
  {
    id: "session-22",
    title: "Living with OCD: Daily Coping Strategies",
    description:
      "Virtual support circle for sharing day-to-day coping strategies. Discuss challenges, victories, and practical tips for managing OCD in everyday life.",
    type: "virtual",
    format: "support-circle",
    startTime: addDays(new Date(), 1).toISOString(),
    endTime: addHours(addDays(new Date(), 1), 1.5).toISOString(),
    timezone: "America/Los_Angeles",
    duration: 90,
    maxParticipants: 15,
    currentParticipants: 11,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/ocd-daily-coping",
    host: mockHosts[2],
    communityId: "a1124eaa-fa27-46e7-b32a-5dc7e446ee29", // REAL OCD Support Community ID
    communityName: "OCD Support Community",
    roomId: "5460e7ec-deeb-4fad-abe2-e84fcb0ed199",
    roomName: "General Discussion",
    status: "upcoming",
    tags: ["ocd", "coping-strategies", "support-circle", "peer-support"],
    requiresApproval: false,
    isRecurring: true,
    recurrencePattern: {
      frequency: "weekly",
      daysOfWeek: [2], // Tuesday
    },
    participants: generateMockParticipants(11, "session-22"),
    waitlist: [],
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: new Date().toISOString(),
    userRSVP: "none",
  },

  // Past Completed Session - OCD SUPPORT COMMUNITY
  {
    id: "session-23",
    title: "Understanding OCD Subtypes",
    description:
      "Educational session on different manifestations of OCD including contamination fears, harm OCD, pure-O, and scrupulosity. Learn that you're not alone in your specific experiences.",
    type: "virtual",
    format: "webinar",
    startTime: subDays(new Date(), 15).toISOString(),
    endTime: addHours(subDays(new Date(), 15), 1).toISOString(),
    timezone: "America/New_York",
    duration: 60,
    maxParticipants: 50,
    currentParticipants: 43,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/ocd-subtypes",
    host: mockHosts[1],
    communityId: "a1124eaa-fa27-46e7-b32a-5dc7e446ee29", // REAL OCD Support Community ID
    communityName: "OCD Support Community",
    roomId: "5460e7ec-deeb-4fad-abe2-e84fcb0ed199",
    roomName: "General Discussion",
    status: "completed",
    tags: ["ocd", "education", "subtypes", "webinar", "understanding"],
    requiresApproval: false,
    isRecurring: false,
    participants: generateMockParticipants(43, "session-23"),
    waitlist: [],
    recordingUrl: "https://mentara.app/recordings/ocd-subtypes-2024",
    notes:
      "Eye-opening session! Many participants felt validated learning about different OCD presentations.",
    materials: [
      "https://mentara.app/resources/ocd-subtypes-guide.pdf",
      "https://mentara.app/resources/identifying-your-ocd-type.pdf",
    ],
    createdAt: subDays(new Date(), 45).toISOString(),
    updatedAt: subDays(new Date(), 15).toISOString(),
    userRSVP: "attending",
  },

  // Past Completed Session - Virtual Webinar
  {
    id: "session-15",
    title: "Understanding Social Anxiety",
    description:
      "Educational webinar on social anxiety disorder - what it is, how it affects daily life, and evidence-based treatment approaches including CBT and exposure therapy.",
    type: "virtual",
    format: "webinar",
    startTime: subDays(new Date(), 12).toISOString(),
    endTime: addHours(subDays(new Date(), 12), 1).toISOString(),
    timezone: "America/New_York",
    duration: 60,
    maxParticipants: 80,
    currentParticipants: 72,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/social-anxiety-webinar",
    host: mockHosts[1],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-2",
    roomName: "Workshops",
    status: "completed",
    tags: ["social-anxiety", "education", "webinar", "cbt"],
    requiresApproval: false,
    isRecurring: false,
    participants: generateMockParticipants(72, "session-15"),
    waitlist: [],
    recordingUrl: "https://mentara.app/recordings/social-anxiety-webinar",
    notes:
      "Excellent Q&A session. Participants appreciated the practical examples and exposure hierarchy techniques.",
    materials: [
      "https://mentara.app/resources/social-anxiety-guide.pdf",
      "https://mentara.app/resources/exposure-hierarchy-worksheet.pdf",
    ],
    createdAt: subDays(new Date(), 28).toISOString(),
    updatedAt: subDays(new Date(), 12).toISOString(),
    userRSVP: "none",
  },

  // Past Completed Session - In-Person Workshop
  {
    id: "session-16",
    title: "Mindful Movement & Body Awareness",
    description:
      "Gentle yoga and mindfulness practice focusing on body awareness and the mind-body connection. All levels welcome, no yoga experience necessary.",
    type: "in-person",
    format: "meditation",
    startTime: subDays(new Date(), 8).toISOString(),
    endTime: addHours(subDays(new Date(), 8), 1).toISOString(),
    timezone: "America/Los_Angeles",
    duration: 60,
    maxParticipants: 25,
    currentParticipants: 22,
    waitlistCount: 0,
    location: "Serenity Yoga Studio, 888 Wellness Boulevard",
    host: mockHosts[3],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-3",
    roomName: "Mindfulness",
    status: "completed",
    tags: ["yoga", "mindfulness", "body-awareness", "movement"],
    requiresApproval: false,
    isRecurring: true,
    recurrencePattern: {
      frequency: "biweekly",
      daysOfWeek: [0], // Sunday
    },
    participants: generateMockParticipants(22, "session-16"),
    waitlist: [],
    notes:
      "Peaceful session with wonderful energy. Participants felt more connected to their bodies and minds.",
    createdAt: subDays(new Date(), 50).toISOString(),
    updatedAt: subDays(new Date(), 8).toISOString(),
    userRSVP: "attending",
  },

  // Past Completed Session - Virtual Group Therapy
  {
    id: "session-17",
    title: "Grief & Loss Support Group",
    description:
      "A safe space to process grief and loss. Share your story, hear others' experiences, and find comfort in community support.",
    type: "virtual",
    format: "group-therapy",
    startTime: subDays(new Date(), 4).toISOString(),
    endTime: addHours(subDays(new Date(), 4), 2).toISOString(),
    timezone: "America/Chicago",
    duration: 120,
    maxParticipants: 10,
    currentParticipants: 8,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/grief-support",
    meetingPassword: "healing123",
    host: mockHosts[0],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-1",
    roomName: "Support Groups",
    status: "completed",
    tags: ["grief", "loss", "support-group", "therapy", "healing"],
    requiresApproval: true,
    isRecurring: true,
    recurrencePattern: {
      frequency: "weekly",
      daysOfWeek: [4], // Thursday
    },
    participants: generateMockParticipants(8, "session-17"),
    waitlist: [],
    notes:
      "Deeply moving session. Created a safe container for participants to share and process their grief.",
    createdAt: subDays(new Date(), 60).toISOString(),
    updatedAt: subDays(new Date(), 4).toISOString(),
    userRSVP: "none",
  },

  // Past Completed Session - Virtual Webinar
  {
    id: "session-18",
    title: "Healthy Relationships & Boundaries",
    description:
      "Learn to establish and maintain healthy boundaries in relationships. Topics include communication skills, recognizing red flags, and self-care in relationships.",
    type: "virtual",
    format: "webinar",
    startTime: subDays(new Date(), 20).toISOString(),
    endTime: addHours(subDays(new Date(), 20), 1.5).toISOString(),
    timezone: "America/New_York",
    duration: 90,
    maxParticipants: 60,
    currentParticipants: 54,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/relationships-webinar",
    host: mockHosts[1],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-2",
    roomName: "Workshops",
    status: "completed",
    tags: ["relationships", "boundaries", "communication", "self-care"],
    requiresApproval: false,
    isRecurring: false,
    participants: generateMockParticipants(54, "session-18"),
    waitlist: [],
    recordingUrl: "https://mentara.app/recordings/relationships-webinar",
    notes:
      "Very popular topic! Great discussions on setting boundaries. Many participants had 'aha' moments.",
    materials: [
      "https://mentara.app/resources/boundaries-workbook.pdf",
      "https://mentara.app/resources/communication-scripts.pdf",
    ],
    createdAt: subDays(new Date(), 35).toISOString(),
    updatedAt: subDays(new Date(), 20).toISOString(),
    userRSVP: "attending",
  },

  // Past Completed Session - In-Person Support Circle
  {
    id: "session-19",
    title: "Weekend Wellness Walk & Talk",
    description:
      "Combine gentle exercise with social connection. Walk through the local park while having meaningful conversations about mental wellness.",
    type: "in-person",
    format: "social",
    startTime: subDays(new Date(), 9).toISOString(),
    endTime: addHours(subDays(new Date(), 9), 1.5).toISOString(),
    timezone: "America/Los_Angeles",
    duration: 90,
    maxParticipants: 15,
    currentParticipants: 12,
    waitlistCount: 0,
    location: "Central Park Main Entrance",
    host: mockHosts[4],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    status: "completed",
    tags: ["exercise", "walking", "social", "outdoors", "wellness"],
    requiresApproval: false,
    isRecurring: true,
    recurrencePattern: {
      frequency: "weekly",
      daysOfWeek: [6], // Saturday
    },
    participants: generateMockParticipants(12, "session-19"),
    waitlist: [],
    notes:
      "Beautiful weather and great conversations! Participants enjoyed the combination of movement and connection.",
    createdAt: subDays(new Date(), 45).toISOString(),
    updatedAt: subDays(new Date(), 9).toISOString(),
    userRSVP: "declined",
  },

  // Past Completed Session - Virtual Workshop
  {
    id: "session-20",
    title: "Managing Panic Attacks: Practical Tools",
    description:
      "Learn immediate techniques to manage panic attacks, understand panic physiology, and develop a personal coping plan.",
    type: "virtual",
    format: "workshop",
    startTime: subDays(new Date(), 18).toISOString(),
    endTime: addHours(subDays(new Date(), 18), 1.5).toISOString(),
    timezone: "America/Chicago",
    duration: 90,
    maxParticipants: 35,
    currentParticipants: 31,
    waitlistCount: 0,
    meetingLink: "https://meet.mentara.app/panic-workshop",
    host: mockHosts[0],
    communityId: "community-1",
    communityName: "Mental Wellness Hub",
    roomId: "room-2",
    roomName: "Workshops",
    status: "completed",
    tags: ["panic-attacks", "anxiety", "coping-skills", "emergency-tools"],
    requiresApproval: false,
    isRecurring: false,
    participants: generateMockParticipants(31, "session-20"),
    waitlist: [],
    recordingUrl: "https://mentara.app/recordings/panic-workshop-2024",
    notes:
      "Very helpful session! Participants practiced grounding techniques and received emergency coping cards.",
    materials: [
      "https://mentara.app/resources/panic-attack-guide.pdf",
      "https://mentara.app/resources/grounding-techniques.pdf",
      "https://mentara.app/resources/emergency-coping-card.pdf",
    ],
    createdAt: subDays(new Date(), 40).toISOString(),
    updatedAt: subDays(new Date(), 18).toISOString(),
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
