"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TherapistApplicationListDtoSchema = exports.TherapistClientRequestQueryDtoSchema = exports.TherapistMeetingQueryDtoSchema = exports.TherapistWorksheetQueryDtoSchema = exports.ApplicationStatusUpdateResponseSchema = exports.SubmitApplicationResponseSchema = exports.SubmitApplicationWithDocumentsRequestSchema = exports.ApplicationListResponseSchema = exports.TherapistRecommendationQuerySchema = exports.WelcomeRecommendationQuerySchema = exports.TherapistRecommendationResponseDtoSchema = exports.TherapistRecommendationRequestSchema = exports.TherapistCredentialsSchema = exports.TherapistWorksheetAssignmentSchema = exports.ApplicationListParamsSchema = exports.UpdateApplicationRequestSchema = exports.CreateApplicationRequestSchema = exports.ApplicationStatusUpdateDtoSchema = exports.TherapistApplicationSchema = exports.ApplicationDocumentSchema = exports.ApplicationStatusSchema = exports.TherapistApplicationDtoSchema = exports.PracticeInfoSchema = exports.SessionFormatSchema = exports.ProfessionalInfoSchema = exports.CertificationSchema = exports.EducationSchema = exports.PersonalInfoSchema = exports.PatientDataSchema = exports.TherapistDashboardDataSchema = exports.TherapistRecommendationResponseSchema = exports.TherapistSearchParamsSchema = exports.MatchCriteriaSchema = exports.TherapistRecommendationSchema = exports.TherapistApplicationIdParamSchema = exports.TherapistIdParamSchema = exports.TherapistApplicationCreateDtoSchema = exports.TherapistRecommendationResponseDtoSchemaLegacy = exports.TherapistRecommendationRequestSchemaLegacy = exports.UpdateTherapistDtoSchema = exports.RegisterTherapistDtoSchema = void 0;
const zod_1 = require("zod");
// Enhanced Therapist Registration Schema (from class-validator DTO)
exports.RegisterTherapistDtoSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    mobile: zod_1.z.string().min(1, 'Mobile is required'),
    province: zod_1.z.string().min(1, 'Province is required'),
    providerType: zod_1.z.string().min(1, 'Provider type is required'),
    professionalLicenseType: zod_1.z.string().min(1, 'Professional license type is required'),
    isPRCLicensed: zod_1.z.boolean(),
    prcLicenseNumber: zod_1.z.string().min(1, 'PRC license number is required'),
    expirationDateOfLicense: zod_1.z.string().datetime().optional(),
    isLicenseActive: zod_1.z.boolean(),
    practiceStartDate: zod_1.z.string().datetime(),
    yearsOfExperience: zod_1.z.string().optional(),
    areasOfExpertise: zod_1.z.array(zod_1.z.string()).min(1, 'At least one area of expertise is required'),
    assessmentTools: zod_1.z.array(zod_1.z.string()).min(1, 'At least one assessment tool is required'),
    therapeuticApproachesUsedList: zod_1.z.array(zod_1.z.string()).min(1, 'At least one therapeutic approach is required'),
    languagesOffered: zod_1.z.array(zod_1.z.string()).min(1, 'At least one language is required'),
    providedOnlineTherapyBefore: zod_1.z.boolean(),
    comfortableUsingVideoConferencing: zod_1.z.boolean(),
    weeklyAvailability: zod_1.z.string().min(1, 'Weekly availability is required'),
    preferredSessionLength: zod_1.z.string().min(1, 'Preferred session length is required'),
    accepts: zod_1.z.array(zod_1.z.string()).min(1, 'Must accept at least one payment method'),
    privateConfidentialSpace: zod_1.z.boolean().optional(),
    compliesWithDataPrivacyAct: zod_1.z.boolean().optional(),
    professionalLiabilityInsurance: zod_1.z.boolean().optional(),
    complaintsOrDisciplinaryActions: zod_1.z.boolean().optional(),
    willingToAbideByPlatformGuidelines: zod_1.z.boolean().optional(),
    sessionLength: zod_1.z.string().optional(),
    hourlyRate: zod_1.z.number().min(0, 'Hourly rate must be positive').optional(),
    bio: zod_1.z.string().optional(),
    profileImageUrl: zod_1.z.string().url().optional(),
    applicationData: zod_1.z.record(zod_1.z.any()).optional()
});
// Update Therapist Schema (from class-validator DTO)
exports.UpdateTherapistDtoSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required').optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
    mobile: zod_1.z.string().optional(),
    province: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    profileImageUrl: zod_1.z.string().url().optional(),
    hourlyRate: zod_1.z.number().min(0, 'Hourly rate must be positive').optional(),
    isActive: zod_1.z.boolean().optional(),
    expertise: zod_1.z.array(zod_1.z.string()).optional(),
    approaches: zod_1.z.array(zod_1.z.string()).optional(),
    languages: zod_1.z.array(zod_1.z.string()).optional(),
    illnessSpecializations: zod_1.z.array(zod_1.z.string()).optional()
});
// Therapist Recommendation Request Schema (Legacy)
exports.TherapistRecommendationRequestSchemaLegacy = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    limit: zod_1.z.number().min(1).max(100).optional(),
    includeInactive: zod_1.z.boolean().optional(),
    province: zod_1.z.string().optional(),
    maxHourlyRate: zod_1.z.number().min(0).optional()
});
// Therapist Recommendation Response Schema (Legacy)
exports.TherapistRecommendationResponseDtoSchemaLegacy = zod_1.z.object({
    totalCount: zod_1.z.number().min(0),
    userConditions: zod_1.z.array(zod_1.z.string()),
    therapists: zod_1.z.array(zod_1.z.any()), // TherapistWithUser with matchScore
    matchCriteria: zod_1.z.object({
        primaryConditions: zod_1.z.array(zod_1.z.string()),
        secondaryConditions: zod_1.z.array(zod_1.z.string()),
        severityLevels: zod_1.z.record(zod_1.z.string())
    }),
    page: zod_1.z.number().min(1).optional(),
    pageSize: zod_1.z.number().min(1).optional()
});
// Comprehensive Therapist Application Schema (from class-validator DTO)
exports.TherapistApplicationCreateDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    mobile: zod_1.z.string().min(1, 'Mobile is required'),
    province: zod_1.z.string().min(1, 'Province is required'),
    providerType: zod_1.z.string().min(1, 'Provider type is required'),
    professionalLicenseType: zod_1.z.string().min(1, 'Professional license type is required'),
    isPRCLicensed: zod_1.z.string().min(1, 'PRC license status is required'),
    prcLicenseNumber: zod_1.z.string().optional(),
    isLicenseActive: zod_1.z.string().optional(),
    expirationDateOfLicense: zod_1.z.string().optional(),
    practiceStartDate: zod_1.z.string().min(1, 'Practice start date is required'),
    areasOfExpertise: zod_1.z.array(zod_1.z.string()).min(1, 'At least one area of expertise is required'),
    assessmentTools: zod_1.z.array(zod_1.z.string()).min(1, 'At least one assessment tool is required'),
    therapeuticApproachesUsedList: zod_1.z.array(zod_1.z.string()).min(1, 'At least one therapeutic approach is required'),
    languagesOffered: zod_1.z.array(zod_1.z.string()).min(1, 'At least one language is required'),
    providedOnlineTherapyBefore: zod_1.z.boolean(),
    comfortableUsingVideoConferencing: zod_1.z.boolean(),
    privateConfidentialSpace: zod_1.z.boolean(),
    compliesWithDataPrivacyAct: zod_1.z.boolean(),
    weeklyAvailability: zod_1.z.string().min(1, 'Weekly availability is required'),
    preferredSessionLength: zod_1.z.string().min(1, 'Preferred session length is required'),
    accepts: zod_1.z.array(zod_1.z.string()).min(1, 'Must accept at least one payment method'),
    bio: zod_1.z.string().optional(),
    hourlyRate: zod_1.z.number().min(0, 'Hourly rate must be positive').optional(),
    professionalLiabilityInsurance: zod_1.z.string().min(1, 'Professional liability insurance status is required'),
    complaintsOrDisciplinaryActions: zod_1.z.string().min(1, 'Complaints or disciplinary actions status is required'),
    complaintsOrDisciplinaryActions_specify: zod_1.z.string().optional(),
    willingToAbideByPlatformGuidelines: zod_1.z.boolean()
});
// Parameter Schemas
exports.TherapistIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid therapist ID format')
});
exports.TherapistApplicationIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid application ID format')
});
// Basic Therapist Information Schema
exports.TherapistRecommendationSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Therapist ID is required'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    title: zod_1.z.string().min(1, 'Title is required'),
    specialties: zod_1.z.array(zod_1.z.string()).min(1, 'At least one specialty is required'),
    hourlyRate: zod_1.z.number().min(0, 'Hourly rate must be positive'),
    experience: zod_1.z.number().min(0, 'Experience must be positive'),
    province: zod_1.z.string().min(1, 'Province is required'),
    isActive: zod_1.z.boolean(),
    rating: zod_1.z.number().min(0).max(5).optional(),
    totalReviews: zod_1.z.number().min(0).optional(),
    bio: zod_1.z.string().optional(),
    profileImage: zod_1.z.string().url().optional(),
    availability: zod_1.z.object({
        timezone: zod_1.z.string().min(1, 'Timezone is required'),
        weeklySchedule: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.object({
            start: zod_1.z.string().min(1, 'Start time is required'),
            end: zod_1.z.string().min(1, 'End time is required')
        }))),
        exceptions: zod_1.z.array(zod_1.z.object({
            date: zod_1.z.string().datetime(),
            isAvailable: zod_1.z.boolean(),
            timeSlots: zod_1.z.array(zod_1.z.object({
                start: zod_1.z.string().min(1, 'Start time is required'),
                end: zod_1.z.string().min(1, 'End time is required')
            })).optional()
        })).optional()
    }).optional(),
    matchScore: zod_1.z.number().min(0).max(100).optional()
});
// Match Criteria Schema
exports.MatchCriteriaSchema = zod_1.z.object({
    primaryConditions: zod_1.z.array(zod_1.z.string()),
    secondaryConditions: zod_1.z.array(zod_1.z.string()),
    severityLevels: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
});
// Therapist Search Parameters Schema
exports.TherapistSearchParamsSchema = zod_1.z.object({
    limit: zod_1.z.number().min(1).max(100).optional(),
    includeInactive: zod_1.z.boolean().optional(),
    province: zod_1.z.string().optional(),
    maxHourlyRate: zod_1.z.number().min(0).optional(),
    specialties: zod_1.z.array(zod_1.z.string()).optional(),
    minRating: zod_1.z.number().min(0).max(5).optional(),
    offset: zod_1.z.number().min(0).optional()
});
// Therapist Recommendation Response Schema
exports.TherapistRecommendationResponseSchema = zod_1.z.object({
    therapists: zod_1.z.array(exports.TherapistRecommendationSchema),
    totalCount: zod_1.z.number().min(0),
    userConditions: zod_1.z.array(zod_1.z.string()),
    matchCriteria: exports.MatchCriteriaSchema,
    page: zod_1.z.number().min(1),
    pageSize: zod_1.z.number().min(1)
});
// Therapist Dashboard Data Schema
exports.TherapistDashboardDataSchema = zod_1.z.object({
    therapist: zod_1.z.object({
        id: zod_1.z.string().min(1),
        name: zod_1.z.string().min(1),
        avatar: zod_1.z.string().url()
    }),
    stats: zod_1.z.object({
        activePatients: zod_1.z.number().min(0),
        rescheduled: zod_1.z.number().min(0),
        cancelled: zod_1.z.number().min(0),
        income: zod_1.z.number().min(0),
        patientStats: zod_1.z.object({
            total: zod_1.z.number().min(0),
            percentage: zod_1.z.number().min(0).max(100),
            months: zod_1.z.number().min(0),
            chartData: zod_1.z.array(zod_1.z.object({
                month: zod_1.z.string().min(1),
                value: zod_1.z.number().min(0)
            }))
        })
    }),
    upcomingAppointments: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().min(1),
        patientId: zod_1.z.string().min(1),
        patientName: zod_1.z.string().min(1),
        time: zod_1.z.string().min(1),
        date: zod_1.z.string().datetime(),
        type: zod_1.z.string().min(1),
        status: zod_1.z.enum(['scheduled', 'confirmed', 'cancelled', 'completed'])
    }))
});
// Patient Data Schema
exports.PatientDataSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Patient ID is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    fullName: zod_1.z.string().min(1, 'Full name is required'),
    avatar: zod_1.z.string().url(),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    age: zod_1.z.number().min(0).max(150),
    diagnosis: zod_1.z.string().min(1, 'Diagnosis is required'),
    treatmentPlan: zod_1.z.string().min(1, 'Treatment plan is required'),
    currentSession: zod_1.z.number().min(0),
    totalSessions: zod_1.z.number().min(0),
    sessions: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().min(1),
        date: zod_1.z.string().datetime(),
        duration: zod_1.z.number().min(0),
        notes: zod_1.z.string(),
        type: zod_1.z.enum(['initial', 'follow-up', 'crisis', 'final']),
        status: zod_1.z.enum(['scheduled', 'completed', 'cancelled', 'no-show'])
    }))
});
// Therapist Application Schemas
exports.PersonalInfoSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    middleName: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    birthDate: zod_1.z.string().datetime(),
    address: zod_1.z.string().min(1, 'Address is required'),
    city: zod_1.z.string().min(1, 'City is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    zipCode: zod_1.z.string().min(1, 'Zip code is required'),
    country: zod_1.z.string().min(1, 'Country is required')
});
exports.EducationSchema = zod_1.z.object({
    degree: zod_1.z.string().min(1, 'Degree is required'),
    institution: zod_1.z.string().min(1, 'Institution is required'),
    graduationYear: zod_1.z.number().min(1900).max(new Date().getFullYear())
});
exports.CertificationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Certification name is required'),
    issuingOrganization: zod_1.z.string().min(1, 'Issuing organization is required'),
    issueDate: zod_1.z.string().datetime(),
    expirationDate: zod_1.z.string().datetime().optional()
});
exports.ProfessionalInfoSchema = zod_1.z.object({
    licenseNumber: zod_1.z.string().min(1, 'License number is required'),
    licenseState: zod_1.z.string().min(1, 'License state is required'),
    licenseExpiration: zod_1.z.string().datetime(),
    specialties: zod_1.z.array(zod_1.z.string()).min(1, 'At least one specialty is required'),
    yearsOfExperience: zod_1.z.number().min(0, 'Years of experience must be positive'),
    education: zod_1.z.array(exports.EducationSchema).min(1, 'At least one education record is required'),
    certifications: zod_1.z.array(exports.CertificationSchema),
    languages: zod_1.z.array(zod_1.z.string()).min(1, 'At least one language is required'),
    bio: zod_1.z.string().min(10, 'Bio must be at least 10 characters'),
    approach: zod_1.z.string().min(10, 'Approach must be at least 10 characters')
});
exports.SessionFormatSchema = zod_1.z.enum(['in-person', 'video', 'phone']);
exports.PracticeInfoSchema = zod_1.z.object({
    sessionFormats: zod_1.z.array(exports.SessionFormatSchema).min(1, 'At least one session format is required'),
    availability: zod_1.z.object({
        timezone: zod_1.z.string().min(1, 'Timezone is required'),
        schedule: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
            isAvailable: zod_1.z.boolean(),
            startTime: zod_1.z.string().optional(),
            endTime: zod_1.z.string().optional()
        }))
    }),
    pricing: zod_1.z.object({
        sessionFee: zod_1.z.number().min(0, 'Session fee must be positive'),
        currency: zod_1.z.string().min(1, 'Currency is required'),
        acceptsInsurance: zod_1.z.boolean(),
        insuranceProviders: zod_1.z.array(zod_1.z.string()).optional()
    })
});
exports.TherapistApplicationDtoSchema = zod_1.z.object({
    personalInfo: exports.PersonalInfoSchema,
    professionalInfo: exports.ProfessionalInfoSchema,
    practiceInfo: exports.PracticeInfoSchema
});
// Application Status Schema
exports.ApplicationStatusSchema = zod_1.z.enum([
    'pending',
    'under_review',
    'approved',
    'rejected',
    'additional_info_required'
]);
// Document Schema
exports.ApplicationDocumentSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    filename: zod_1.z.string().min(1),
    originalName: zod_1.z.string().min(1),
    url: zod_1.z.string().url(),
    fileType: zod_1.z.enum(['resume', 'license', 'certification', 'transcript', 'other']),
    uploadedAt: zod_1.z.string().datetime()
});
// Full Therapist Application Schema
exports.TherapistApplicationSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    applicantId: zod_1.z.string().min(1),
    applicant: zod_1.z.object({
        id: zod_1.z.string().min(1),
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        email: zod_1.z.string().email()
    }),
    personalInfo: exports.PersonalInfoSchema,
    professionalInfo: exports.ProfessionalInfoSchema,
    practiceInfo: exports.PracticeInfoSchema,
    status: exports.ApplicationStatusSchema,
    submittedAt: zod_1.z.string().datetime(),
    reviewedAt: zod_1.z.string().datetime().optional(),
    reviewedBy: zod_1.z.object({
        id: zod_1.z.string().min(1),
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1)
    }).optional(),
    adminNotes: zod_1.z.string().optional(),
    rejectionReason: zod_1.z.string().optional(),
    documents: zod_1.z.array(exports.ApplicationDocumentSchema),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Application Status Update Schema
exports.ApplicationStatusUpdateDtoSchema = zod_1.z.object({
    status: exports.ApplicationStatusSchema,
    adminNotes: zod_1.z.string().optional(),
    rejectionReason: zod_1.z.string().optional()
});
// Create and Update Application Request Schemas
exports.CreateApplicationRequestSchema = exports.TherapistApplicationDtoSchema;
exports.UpdateApplicationRequestSchema = exports.TherapistApplicationDtoSchema.partial();
// Application List Parameters Schema
exports.ApplicationListParamsSchema = zod_1.z.object({
    status: exports.ApplicationStatusSchema.optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    sortBy: zod_1.z.enum(['submittedAt', 'status', 'lastName']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Therapist-specific Worksheet Assignment Schema
exports.TherapistWorksheetAssignmentSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    worksheetId: zod_1.z.string().min(1),
    patientId: zod_1.z.string().min(1),
    therapistId: zod_1.z.string().min(1),
    assignedAt: zod_1.z.string().datetime(),
    dueDate: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(['assigned', 'in_progress', 'completed', 'overdue']),
    instructions: zod_1.z.string().optional(),
    feedback: zod_1.z.string().optional()
});
// Therapist Credentials Schema
exports.TherapistCredentialsSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    therapistId: zod_1.z.string().min(1),
    licenseNumber: zod_1.z.string().min(1),
    licenseType: zod_1.z.string().min(1),
    issuingState: zod_1.z.string().min(1),
    issueDate: zod_1.z.string().datetime(),
    expirationDate: zod_1.z.string().datetime(),
    isActive: zod_1.z.boolean(),
    isVerified: zod_1.z.boolean(),
    verifiedAt: zod_1.z.string().datetime().optional(),
    verifiedBy: zod_1.z.string().optional()
});
// Therapist Recommendation Request Schema
exports.TherapistRecommendationRequestSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    limit: zod_1.z.number().min(1).max(100).default(10),
    includeInactive: zod_1.z.boolean().default(false),
    province: zod_1.z.string().optional(),
    maxHourlyRate: zod_1.z.number().min(0).optional(),
});
// Therapist Recommendation Response Schema
exports.TherapistRecommendationResponseDtoSchema = zod_1.z.object({
    therapists: zod_1.z.array(exports.TherapistRecommendationSchema),
    totalCount: zod_1.z.number().min(0),
    userConditions: zod_1.z.array(zod_1.z.string()),
    matchCriteria: exports.MatchCriteriaSchema,
    page: zod_1.z.number().min(1),
    pageSize: zod_1.z.number().min(1),
});
// Welcome Recommendation Query Schema
exports.WelcomeRecommendationQuerySchema = zod_1.z.object({
    limit: zod_1.z.number().min(1).max(100).default(8),
    province: zod_1.z.string().optional(),
    forceRefresh: zod_1.z.boolean().default(false),
});
// Therapist Recommendation Query Schema for GET /therapist-recommendations
exports.TherapistRecommendationQuerySchema = zod_1.z.object({
    limit: zod_1.z.number().min(1).max(100).default(10),
    includeInactive: zod_1.z.boolean().default(false),
    province: zod_1.z.string().optional(),
    maxHourlyRate: zod_1.z.number().min(0).optional(),
});
// Application List Response Schema
exports.ApplicationListResponseSchema = zod_1.z.object({
    applications: zod_1.z.array(exports.TherapistApplicationSchema),
    total: zod_1.z.number().min(0),
    page: zod_1.z.number().min(1),
    limit: zod_1.z.number().min(1),
    hasMore: zod_1.z.boolean()
});
// Submit Application With Documents Request Schema
exports.SubmitApplicationWithDocumentsRequestSchema = zod_1.z.object({
    application: exports.TherapistApplicationDtoSchema,
    files: zod_1.z.array(zod_1.z.any()), // File objects
    fileTypes: zod_1.z.record(zod_1.z.string()) // Mapping of file indices to document types
});
// Submit Application Response Schema
exports.SubmitApplicationResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['pending', 'under_review', 'approved', 'rejected']),
    submittedAt: zod_1.z.string().datetime(),
    message: zod_1.z.string().optional(),
    nextSteps: zod_1.z.array(zod_1.z.string()).optional()
});
// Application Status Update Response Schema
exports.ApplicationStatusUpdateResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['pending', 'under_review', 'approved', 'rejected']),
    updatedAt: zod_1.z.string().datetime(),
    updatedBy: zod_1.z.string().uuid(),
    adminNotes: zod_1.z.string().optional(),
    notificationSent: zod_1.z.boolean().default(false)
});
// Additional DTOs for service operations
exports.TherapistWorksheetQueryDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['assigned', 'in_progress', 'completed', 'overdue']).optional(),
    clientId: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0)
});
exports.TherapistMeetingQueryDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0)
});
exports.TherapistClientRequestQueryDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'accepted', 'declined', 'expired']).optional(),
    priority: zod_1.z.enum(['high', 'medium', 'low']).optional(),
    dateRange: zod_1.z.enum(['today', 'week', 'month', 'all']).optional(),
    sortBy: zod_1.z.enum(['newest', 'oldest', 'priority', 'match_score']).optional(),
    search: zod_1.z.string().optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0)
});
exports.TherapistApplicationListDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'under_review', 'approved', 'rejected', 'additional_info_required']).optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0),
    sortBy: zod_1.z.enum(['submittedAt', 'status', 'lastName']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
//# sourceMappingURL=therapist.js.map