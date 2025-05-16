// Mock data for therapists
export interface TherapistData {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  experience: number;
  availableTimes: {
    day: string;
    time: string;
  }[];
  isActive: boolean;
  bio: string;
  imageUrl: string;
  rating: number;
  sessionPrice: number;
  sessionDuration: number;
}

export interface RecommendedTherapistData {
  id: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  experience: number;
  description: string;
  photoUrl: string;
}

export interface MeetingData {
  id: string;
  title: string;
  therapistId: string;
  therapistName: string;
  status: "scheduled" | "started" | "completed" | "cancelled";
  dateTime: string;
  duration: number; // minutes
  timeToStart?: string;
}

// Mock therapist data for listing
export const mockTherapists: TherapistData[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    title: "Clinical Psychologist",
    specialties: ["CBT", "Anxiety", "Depression"],
    experience: 8,
    availableTimes: [
      { day: "Monday", time: "10:15 - 11:00" },
      { day: "Wednesday", time: "14:00 - 14:45" },
    ],
    isActive: true,
    bio: "Specializing in cognitive behavioral therapy with 8+ years of experience helping patients overcome anxiety and depression.",
    imageUrl: "/team/therapist1.jpg",
    rating: 4.9,
    sessionPrice: 120,
    sessionDuration: 45,
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    title: "Licensed Therapist",
    specialties: ["DBT", "Trauma", "PTSD"],
    experience: 12,
    availableTimes: [
      { day: "Tuesday", time: "11:00 - 12:00" },
      { day: "Thursday", time: "15:30 - 16:30" },
    ],
    isActive: true,
    bio: "Expert in dialectical behavior therapy and trauma-focused treatments with over a decade of clinical experience.",
    imageUrl: "/team/therapist2.jpg",
    rating: 4.8,
    sessionPrice: 150,
    sessionDuration: 60,
  },
  {
    id: "3",
    name: "Dr. Olivia Rodriguez",
    title: "Family Therapist",
    specialties: [
      "Family Therapy",
      "Couples Counseling",
      "Relationship Issues",
    ],
    experience: 10,
    availableTimes: [
      { day: "Monday", time: "16:00 - 17:00" },
      { day: "Friday", time: "10:00 - 11:00" },
    ],
    isActive: true,
    bio: "Dedicated to helping families and couples build healthier relationships through evidence-based therapeutic approaches.",
    imageUrl: "/team/therapist3.jpg",
    rating: 4.7,
    sessionPrice: 130,
    sessionDuration: 60,
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    title: "Psychiatric Therapist",
    specialties: ["Medication Management", "Bipolar Disorder", "Schizophrenia"],
    experience: 15,
    availableTimes: [
      { day: "Wednesday", time: "09:00 - 10:00" },
      { day: "Thursday", time: "13:00 - 14:00" },
    ],
    isActive: false,
    bio: "Experienced psychiatric therapist with expertise in serious mental health conditions and integrated treatment approaches.",
    imageUrl: "/team/therapist4.jpg",
    rating: 4.6,
    sessionPrice: 170,
    sessionDuration: 50,
  },
];

// Mock data for recommended therapists
export const mockRecommendedTherapists: RecommendedTherapistData[] = [
  {
    id: "5",
    firstName: "Claire",
    lastName: "Cottrill",
    specialties: ["CBT", "EMDR"],
    experience: 3,
    description:
      "I am a trauma-informed and authentic therapist dedicated to guiding you with self-growth strategies and genuine wisdom.",
    photoUrl: "/team/claire1.jpg",
  },
  {
    id: "6",
    firstName: "Emma",
    lastName: "Williams",
    specialties: ["Play Therapy", "Child Psychology"],
    experience: 5,
    description:
      "Specializing in child and adolescent therapy with a focus on play therapy and developmental psychology.",
    photoUrl: "/team/claire2.jpg",
  },
  {
    id: "7",
    firstName: "David",
    lastName: "Martinez",
    specialties: ["LGBTQ+ Issues", "Identity"],
    experience: 7,
    description:
      "Creating a safe space for exploring identity and personal growth with a focus on LGBTQ+ affirming therapy.",
    photoUrl: "/team/claire3.jpg",
  },
];

// Mock data for meetings
export const mockMeetings: MeetingData[] = [
  {
    id: "m1",
    title: "CBT Session",
    therapistId: "1",
    therapistName: "Dr. Sarah Johnson",
    status: "started",
    dateTime: "2025-05-16T10:15:00",
    duration: 45,
  },
  {
    id: "m2",
    title: "Family Therapy",
    therapistId: "3",
    therapistName: "Dr. Olivia Rodriguez",
    status: "scheduled",
    dateTime: "2025-05-18T16:00:00",
    duration: 60,
    timeToStart: "in 2 days",
  },
  {
    id: "m3",
    title: "Initial Consultation",
    therapistId: "2",
    therapistName: "Dr. Michael Chen",
    status: "scheduled",
    dateTime: "2025-05-23T11:00:00",
    duration: 60,
    timeToStart: "in 7 days",
  },
];
