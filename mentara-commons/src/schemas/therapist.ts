import { z } from 'zod';

// Basic Therapist Information Schema
export const TherapistRecommendationSchema = z.object({
  id: z.string().min(1, 'Therapist ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().min(1, 'Title is required'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive'),
  experience: z.number().min(0, 'Experience must be positive'),
  province: z.string().min(1, 'Province is required'),
  isActive: z.boolean(),
  rating: z.number().min(0).max(5).optional(),
  totalReviews: z.number().min(0).optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
  availability: z.object({
    timezone: z.string().min(1, 'Timezone is required'),
    weeklySchedule: z.record(
      z.string(),
      z.array(z.object({
        start: z.string().min(1, 'Start time is required'),
        end: z.string().min(1, 'End time is required')
      }))
    ),
    exceptions: z.array(z.object({
      date: z.string().datetime(),
      isAvailable: z.boolean(),
      timeSlots: z.array(z.object({
        start: z.string().min(1, 'Start time is required'),
        end: z.string().min(1, 'End time is required')
      })).optional()
    })).optional()
  }).optional(),
  matchScore: z.number().min(0).max(100).optional()
});

// Match Criteria Schema
export const MatchCriteriaSchema = z.object({
  primaryConditions: z.array(z.string()),
  secondaryConditions: z.array(z.string()),
  severityLevels: z.record(z.string(), z.string())
});

// Therapist Search Parameters Schema
export const TherapistSearchParamsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  includeInactive: z.boolean().optional(),
  province: z.string().optional(),
  maxHourlyRate: z.number().min(0).optional(),
  specialties: z.array(z.string()).optional(),
  minRating: z.number().min(0).max(5).optional(),
  offset: z.number().min(0).optional()
});

// Therapist Recommendation Response Schema
export const TherapistRecommendationResponseSchema = z.object({
  therapists: z.array(TherapistRecommendationSchema),
  totalCount: z.number().min(0),
  userConditions: z.array(z.string()),
  matchCriteria: MatchCriteriaSchema,
  page: z.number().min(1),
  pageSize: z.number().min(1)
});

// Therapist Dashboard Data Schema
export const TherapistDashboardDataSchema = z.object({
  therapist: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    avatar: z.string().url()
  }),
  stats: z.object({
    activePatients: z.number().min(0),
    rescheduled: z.number().min(0),
    cancelled: z.number().min(0),
    income: z.number().min(0),
    patientStats: z.object({
      total: z.number().min(0),
      percentage: z.number().min(0).max(100),
      months: z.number().min(0),
      chartData: z.array(z.object({
        month: z.string().min(1),
        value: z.number().min(0)
      }))
    })
  }),
  upcomingAppointments: z.array(z.object({
    id: z.string().min(1),
    patientId: z.string().min(1),
    patientName: z.string().min(1),
    time: z.string().min(1),
    date: z.string().datetime(),
    type: z.string().min(1),
    status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed'])
  }))
});

// Patient Data Schema
export const PatientDataSchema = z.object({
  id: z.string().min(1, 'Patient ID is required'),
  name: z.string().min(1, 'Name is required'),
  fullName: z.string().min(1, 'Full name is required'),
  avatar: z.string().url(),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required'),
  age: z.number().min(0).max(150),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatmentPlan: z.string().min(1, 'Treatment plan is required'),
  currentSession: z.number().min(0),
  totalSessions: z.number().min(0),
  sessions: z.array(z.object({
    id: z.string().min(1),
    date: z.string().datetime(),
    duration: z.number().min(0),
    notes: z.string(),
    type: z.enum(['initial', 'follow-up', 'crisis', 'final']),
    status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show'])
  }))
});

// Therapist Application Schemas
export const PersonalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required'),
  birthDate: z.string().datetime(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required')
});

export const EducationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  graduationYear: z.number().min(1900).max(new Date().getFullYear())
});

export const CertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuingOrganization: z.string().min(1, 'Issuing organization is required'),
  issueDate: z.string().datetime(),
  expirationDate: z.string().datetime().optional()
});

export const ProfessionalInfoSchema = z.object({
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseState: z.string().min(1, 'License state is required'),
  licenseExpiration: z.string().datetime(),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  yearsOfExperience: z.number().min(0, 'Years of experience must be positive'),
  education: z.array(EducationSchema).min(1, 'At least one education record is required'),
  certifications: z.array(CertificationSchema),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  approach: z.string().min(10, 'Approach must be at least 10 characters')
});

export const SessionFormatSchema = z.enum(['in-person', 'video', 'phone']);

export const PracticeInfoSchema = z.object({
  sessionFormats: z.array(SessionFormatSchema).min(1, 'At least one session format is required'),
  availability: z.object({
    timezone: z.string().min(1, 'Timezone is required'),
    schedule: z.record(
      z.string(),
      z.object({
        isAvailable: z.boolean(),
        startTime: z.string().optional(),
        endTime: z.string().optional()
      })
    )
  }),
  pricing: z.object({
    sessionFee: z.number().min(0, 'Session fee must be positive'),
    currency: z.string().min(1, 'Currency is required'),
    acceptsInsurance: z.boolean(),
    insuranceProviders: z.array(z.string()).optional()
  })
});

export const TherapistApplicationDtoSchema = z.object({
  personalInfo: PersonalInfoSchema,
  professionalInfo: ProfessionalInfoSchema,
  practiceInfo: PracticeInfoSchema
});

// Application Status Schema
export const ApplicationStatusSchema = z.enum([
  'pending',
  'under_review', 
  'approved',
  'rejected',
  'additional_info_required'
]);

// Document Schema
export const ApplicationDocumentSchema = z.object({
  id: z.string().min(1),
  filename: z.string().min(1),
  originalName: z.string().min(1),
  url: z.string().url(),
  fileType: z.enum(['resume', 'license', 'certification', 'transcript', 'other']),
  uploadedAt: z.string().datetime()
});

// Full Therapist Application Schema
export const TherapistApplicationSchema = z.object({
  id: z.string().min(1),
  applicantId: z.string().min(1),
  applicant: z.object({
    id: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email()
  }),
  personalInfo: PersonalInfoSchema,
  professionalInfo: ProfessionalInfoSchema,
  practiceInfo: PracticeInfoSchema,
  status: ApplicationStatusSchema,
  submittedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().optional(),
  reviewedBy: z.object({
    id: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
  }).optional(),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  documents: z.array(ApplicationDocumentSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Application Status Update Schema
export const ApplicationStatusUpdateDtoSchema = z.object({
  status: ApplicationStatusSchema,
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional()
});

// Create and Update Application Request Schemas
export const CreateApplicationRequestSchema = TherapistApplicationDtoSchema;
export const UpdateApplicationRequestSchema = TherapistApplicationDtoSchema.partial();

// Application List Parameters Schema
export const ApplicationListParamsSchema = z.object({
  status: ApplicationStatusSchema.optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['submittedAt', 'status', 'lastName']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Worksheet Assignment Schema
export const WorksheetAssignmentSchema = z.object({
  id: z.string().min(1),
  worksheetId: z.string().min(1),
  patientId: z.string().min(1),
  therapistId: z.string().min(1),
  assignedAt: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['assigned', 'in_progress', 'completed', 'overdue']),
  instructions: z.string().optional(),
  feedback: z.string().optional()
});

// Therapist Credentials Schema
export const TherapistCredentialsSchema = z.object({
  id: z.string().min(1),
  therapistId: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseType: z.string().min(1),
  issuingState: z.string().min(1),
  issueDate: z.string().datetime(),
  expirationDate: z.string().datetime(),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  verifiedAt: z.string().datetime().optional(),
  verifiedBy: z.string().optional()
});

// Type inference exports
export type TherapistRecommendation = z.infer<typeof TherapistRecommendationSchema>;
export type MatchCriteria = z.infer<typeof MatchCriteriaSchema>;
export type TherapistSearchParams = z.infer<typeof TherapistSearchParamsSchema>;
export type TherapistRecommendationResponse = z.infer<typeof TherapistRecommendationResponseSchema>;
export type TherapistDashboardData = z.infer<typeof TherapistDashboardDataSchema>;
export type PatientData = z.infer<typeof PatientDataSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type ProfessionalInfo = z.infer<typeof ProfessionalInfoSchema>;
export type PracticeInfo = z.infer<typeof PracticeInfoSchema>;
export type TherapistApplicationDto = z.infer<typeof TherapistApplicationDtoSchema>;
export type TherapistApplication = z.infer<typeof TherapistApplicationSchema>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
export type ApplicationDocument = z.infer<typeof ApplicationDocumentSchema>;
export type ApplicationStatusUpdateDto = z.infer<typeof ApplicationStatusUpdateDtoSchema>;
export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>;
export type UpdateApplicationRequest = z.infer<typeof UpdateApplicationRequestSchema>;
export type ApplicationListParams = z.infer<typeof ApplicationListParamsSchema>;
export type WorksheetAssignment = z.infer<typeof WorksheetAssignmentSchema>;
export type TherapistCredentials = z.infer<typeof TherapistCredentialsSchema>;
export type SessionFormat = z.infer<typeof SessionFormatSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Certification = z.infer<typeof CertificationSchema>;