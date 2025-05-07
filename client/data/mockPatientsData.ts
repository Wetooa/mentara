export const mockPatientsData = [
  {
    id: "pat-001",
    name: "Iron Man",
    fullName: "Alexandra Korsova",
    avatar: "/patient-1.png",
    email: "iron.fit@gmail.com",
    phone: "(+63) 956 7672 261",
    age: 24,
    diagnosis: "Alcohol abuse",
    treatmentPlan: "Cognitive Behavioral Therapy (CBT)",
    currentSession: 1,
    totalSessions: 7,
    sessions: [
      {
        id: "session-001",
        number: 1,
        date: "2025-04-15",
        notes:
          "Patient reports struggling with alcohol use over the past 5 years. Recently experienced increased frequency and volume of drinking, leading to missed workdays and conflict with spouse. Patient self-referred after a confrontation at home.",
      },
    ],
    worksheets: [
      {
        id: "ws-001",
        title: "Weekly Drinking Log",
        assignedDate: "2025-04-15",
        status: "completed",
      },
      {
        id: "ws-002",
        title: "Trigger Identification Exercise",
        assignedDate: "2025-04-18",
        status: "pending",
      },
    ],
  },
  {
    id: "pat-002",
    name: "Jane Smith",
    fullName: "Jane Maria Smith",
    avatar: "/patient-2.png",
    email: "jane.smith@gmail.com",
    phone: "(+63) 912 3456 789",
    age: 35,
    diagnosis: "Trauma",
    treatmentPlan: "EMDR Therapy",
    currentSession: 3,
    totalSessions: 12,
    sessions: [
      {
        id: "session-001",
        number: 1,
        date: "2025-03-01",
        notes:
          "Initial assessment. Patient reports trauma stemming from a car accident 2 years ago. Experiencing flashbacks, insomnia, and heightened anxiety.",
      },
      {
        id: "session-002",
        number: 2,
        date: "2025-03-08",
        notes:
          "Established rapport and introduced EMDR therapy concepts. Patient receptive to treatment approach.",
      },
      {
        id: "session-003",
        number: 3,
        date: "2025-03-15",
        notes:
          "First EMDR session focusing on memory processing. Patient tolerated procedure well with moderate distress that subsided by end of session.",
      },
    ],
    worksheets: [
      {
        id: "ws-003",
        title: "Trauma Trigger Log",
        assignedDate: "2025-03-02",
        status: "completed",
      },
      {
        id: "ws-004",
        title: "Safe Place Visualization",
        assignedDate: "2025-03-09",
        status: "completed",
      },
      {
        id: "ws-005",
        title: "Negative Cognition Reframing",
        assignedDate: "2025-03-16",
        status: "overdue",
      },
    ],
  },
  {
    id: "pat-003",
    name: "John Doe",
    fullName: "John Michael Doe",
    avatar: "/patient-3.png",
    email: "john.doe@gmail.com",
    phone: "(+63) 923 4567 890",
    age: 28,
    diagnosis: "Alcohol Abuse",
    treatmentPlan: "12-Step Facilitation",
    currentSession: 5,
    totalSessions: 8,
    sessions: [
      {
        id: "session-001",
        number: 1,
        date: "2025-02-10",
        notes:
          "Patient referred through employment assistance program. Reports daily drinking affecting work performance.",
      },
      {
        id: "session-002",
        number: 2,
        date: "2025-02-17",
        notes:
          "Discussed treatment options. Patient agreed to 12-step approach and is willing to attend AA meetings.",
      },
    ],
    worksheets: [
      {
        id: "ws-006",
        title: "Daily Craving Journal",
        assignedDate: "2025-02-11",
        status: "completed",
      },
      {
        id: "ws-007",
        title: "Life Values Assessment",
        assignedDate: "2025-02-18",
        status: "completed",
      },
    ],
  },
  {
    id: "pat-004",
    name: "Sarah Johnson",
    fullName: "Sarah Elizabeth Johnson",
    avatar: "/patient-4.png",
    email: "sarah.j@gmail.com",
    phone: "(+63) 934 5678 901",
    age: 42,
    diagnosis: "Insomnia",
    treatmentPlan: "CBT-I (CBT for Insomnia)",
    currentSession: 2,
    totalSessions: 6,
    sessions: [
      {
        id: "session-001",
        number: 1,
        date: "2025-04-05",
        notes:
          "Patient reports chronic sleep issues for over 10 years. Currently sleeping 3-4 hours per night with significant daytime fatigue.",
      },
    ],
    worksheets: [
      {
        id: "ws-008",
        title: "Sleep Diary",
        assignedDate: "2025-04-06",
        status: "pending",
      },
      {
        id: "ws-009",
        title: "Sleep Hygiene Checklist",
        assignedDate: "2025-04-06",
        status: "pending",
      },
    ],
  },
];
