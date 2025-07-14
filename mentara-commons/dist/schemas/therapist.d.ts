import { z } from 'zod';
export declare const TherapistRecommendationSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    title: z.ZodString;
    specialties: z.ZodArray<z.ZodString, "many">;
    hourlyRate: z.ZodNumber;
    experience: z.ZodNumber;
    province: z.ZodString;
    isActive: z.ZodBoolean;
    rating: z.ZodOptional<z.ZodNumber>;
    totalReviews: z.ZodOptional<z.ZodNumber>;
    bio: z.ZodOptional<z.ZodString>;
    profileImage: z.ZodOptional<z.ZodString>;
    availability: z.ZodOptional<z.ZodObject<{
        timezone: z.ZodString;
        weeklySchedule: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>, "many">>;
        exceptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            date: z.ZodString;
            isAvailable: z.ZodBoolean;
            timeSlots: z.ZodOptional<z.ZodArray<z.ZodObject<{
                start: z.ZodString;
                end: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                start: string;
                end: string;
            }, {
                start: string;
                end: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            date: string;
            isAvailable: boolean;
            timeSlots?: {
                start: string;
                end: string;
            }[] | undefined;
        }, {
            date: string;
            isAvailable: boolean;
            timeSlots?: {
                start: string;
                end: string;
            }[] | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        weeklySchedule: Record<string, {
            start: string;
            end: string;
        }[]>;
        exceptions?: {
            date: string;
            isAvailable: boolean;
            timeSlots?: {
                start: string;
                end: string;
            }[] | undefined;
        }[] | undefined;
    }, {
        timezone: string;
        weeklySchedule: Record<string, {
            start: string;
            end: string;
        }[]>;
        exceptions?: {
            date: string;
            isAvailable: boolean;
            timeSlots?: {
                start: string;
                end: string;
            }[] | undefined;
        }[] | undefined;
    }>>;
    matchScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    hourlyRate: number;
    province: string;
    specialties: string[];
    isActive: boolean;
    experience: number;
    bio?: string | undefined;
    profileImage?: string | undefined;
    rating?: number | undefined;
    totalReviews?: number | undefined;
    availability?: {
        timezone: string;
        weeklySchedule: Record<string, {
            start: string;
            end: string;
        }[]>;
        exceptions?: {
            date: string;
            isAvailable: boolean;
            timeSlots?: {
                start: string;
                end: string;
            }[] | undefined;
        }[] | undefined;
    } | undefined;
    matchScore?: number | undefined;
}, {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    hourlyRate: number;
    province: string;
    specialties: string[];
    isActive: boolean;
    experience: number;
    bio?: string | undefined;
    profileImage?: string | undefined;
    rating?: number | undefined;
    totalReviews?: number | undefined;
    availability?: {
        timezone: string;
        weeklySchedule: Record<string, {
            start: string;
            end: string;
        }[]>;
        exceptions?: {
            date: string;
            isAvailable: boolean;
            timeSlots?: {
                start: string;
                end: string;
            }[] | undefined;
        }[] | undefined;
    } | undefined;
    matchScore?: number | undefined;
}>;
export declare const MatchCriteriaSchema: z.ZodObject<{
    primaryConditions: z.ZodArray<z.ZodString, "many">;
    secondaryConditions: z.ZodArray<z.ZodString, "many">;
    severityLevels: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    primaryConditions: string[];
    secondaryConditions: string[];
    severityLevels: Record<string, string>;
}, {
    primaryConditions: string[];
    secondaryConditions: string[];
    severityLevels: Record<string, string>;
}>;
export declare const TherapistSearchParamsSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    includeInactive: z.ZodOptional<z.ZodBoolean>;
    province: z.ZodOptional<z.ZodString>;
    maxHourlyRate: z.ZodOptional<z.ZodNumber>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minRating: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    province?: string | undefined;
    specialties?: string[] | undefined;
    limit?: number | undefined;
    includeInactive?: boolean | undefined;
    maxHourlyRate?: number | undefined;
    minRating?: number | undefined;
    offset?: number | undefined;
}, {
    province?: string | undefined;
    specialties?: string[] | undefined;
    limit?: number | undefined;
    includeInactive?: boolean | undefined;
    maxHourlyRate?: number | undefined;
    minRating?: number | undefined;
    offset?: number | undefined;
}>;
export declare const TherapistRecommendationResponseSchema: z.ZodObject<{
    therapists: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        title: z.ZodString;
        specialties: z.ZodArray<z.ZodString, "many">;
        hourlyRate: z.ZodNumber;
        experience: z.ZodNumber;
        province: z.ZodString;
        isActive: z.ZodBoolean;
        rating: z.ZodOptional<z.ZodNumber>;
        totalReviews: z.ZodOptional<z.ZodNumber>;
        bio: z.ZodOptional<z.ZodString>;
        profileImage: z.ZodOptional<z.ZodString>;
        availability: z.ZodOptional<z.ZodObject<{
            timezone: z.ZodString;
            weeklySchedule: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
                start: z.ZodString;
                end: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                start: string;
                end: string;
            }, {
                start: string;
                end: string;
            }>, "many">>;
            exceptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                date: z.ZodString;
                isAvailable: z.ZodBoolean;
                timeSlots: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    start: z.ZodString;
                    end: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    start: string;
                    end: string;
                }, {
                    start: string;
                    end: string;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                date: string;
                isAvailable: boolean;
                timeSlots?: {
                    start: string;
                    end: string;
                }[] | undefined;
            }, {
                date: string;
                isAvailable: boolean;
                timeSlots?: {
                    start: string;
                    end: string;
                }[] | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            timezone: string;
            weeklySchedule: Record<string, {
                start: string;
                end: string;
            }[]>;
            exceptions?: {
                date: string;
                isAvailable: boolean;
                timeSlots?: {
                    start: string;
                    end: string;
                }[] | undefined;
            }[] | undefined;
        }, {
            timezone: string;
            weeklySchedule: Record<string, {
                start: string;
                end: string;
            }[]>;
            exceptions?: {
                date: string;
                isAvailable: boolean;
                timeSlots?: {
                    start: string;
                    end: string;
                }[] | undefined;
            }[] | undefined;
        }>>;
        matchScore: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
        title: string;
        hourlyRate: number;
        province: string;
        specialties: string[];
        isActive: boolean;
        experience: number;
        bio?: string | undefined;
        profileImage?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        availability?: {
            timezone: string;
            weeklySchedule: Record<string, {
                start: string;
                end: string;
            }[]>;
            exceptions?: {
                date: string;
                isAvailable: boolean;
                timeSlots?: {
                    start: string;
                    end: string;
                }[] | undefined;
            }[] | undefined;
        } | undefined;
        matchScore?: number | undefined;
    }, {
        id: string;
        firstName: string;
        lastName: string;
        title: string;
        hourlyRate: number;
        province: string;
        specialties: string[];
        isActive: boolean;
        experience: number;
        bio?: string | undefined;
        profileImage?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        availability?: {
            timezone: string;
            weeklySchedule: Record<string, {
                start: string;
                end: string;
            }[]>;
            exceptions?: {
                date: string;
                isAvailable: boolean;
                timeSlots?: {
                    start: string;
                    end: string;
                }[] | undefined;
            }[] | undefined;
        } | undefined;
        matchScore?: number | undefined;
    }>, "many">;
    totalCount: z.ZodNumber;
    userConditions: z.ZodArray<z.ZodString, "many">;
    matchCriteria: z.ZodObject<{
        primaryConditions: z.ZodArray<z.ZodString, "many">;
        secondaryConditions: z.ZodArray<z.ZodString, "many">;
        severityLevels: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        primaryConditions: string[];
        secondaryConditions: string[];
        severityLevels: Record<string, string>;
    }, {
        primaryConditions: string[];
        secondaryConditions: string[];
        severityLevels: Record<string, string>;
    }>;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    therapists: {
        id: string;
        firstName: string;
        lastName: string;
        title: string;
        hourlyRate: number;
        province: string;
        specialties: string[];
        isActive: boolean;
        experience: number;
        bio?: string | undefined;
        profileImage?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        availability?: {
            timezone: string;
            weeklySchedule: Record<string, {
                start: string;
                end: string;
            }[]>;
            exceptions?: {
                date: string;
                isAvailable: boolean;
                timeSlots?: {
                    start: string;
                    end: string;
                }[] | undefined;
            }[] | undefined;
        } | undefined;
        matchScore?: number | undefined;
    }[];
    totalCount: number;
    userConditions: string[];
    matchCriteria: {
        primaryConditions: string[];
        secondaryConditions: string[];
        severityLevels: Record<string, string>;
    };
    page: number;
    pageSize: number;
}, {
    therapists: {
        id: string;
        firstName: string;
        lastName: string;
        title: string;
        hourlyRate: number;
        province: string;
        specialties: string[];
        isActive: boolean;
        experience: number;
        bio?: string | undefined;
        profileImage?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        availability?: {
            timezone: string;
            weeklySchedule: Record<string, {
                start: string;
                end: string;
            }[]>;
            exceptions?: {
                date: string;
                isAvailable: boolean;
                timeSlots?: {
                    start: string;
                    end: string;
                }[] | undefined;
            }[] | undefined;
        } | undefined;
        matchScore?: number | undefined;
    }[];
    totalCount: number;
    userConditions: string[];
    matchCriteria: {
        primaryConditions: string[];
        secondaryConditions: string[];
        severityLevels: Record<string, string>;
    };
    page: number;
    pageSize: number;
}>;
export declare const TherapistDashboardDataSchema: z.ZodObject<{
    therapist: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        avatar: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        avatar: string;
    }, {
        id: string;
        name: string;
        avatar: string;
    }>;
    stats: z.ZodObject<{
        activePatients: z.ZodNumber;
        rescheduled: z.ZodNumber;
        cancelled: z.ZodNumber;
        income: z.ZodNumber;
        patientStats: z.ZodObject<{
            total: z.ZodNumber;
            percentage: z.ZodNumber;
            months: z.ZodNumber;
            chartData: z.ZodArray<z.ZodObject<{
                month: z.ZodString;
                value: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                value: number;
                month: string;
            }, {
                value: number;
                month: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            total: number;
            percentage: number;
            months: number;
            chartData: {
                value: number;
                month: string;
            }[];
        }, {
            total: number;
            percentage: number;
            months: number;
            chartData: {
                value: number;
                month: string;
            }[];
        }>;
    }, "strip", z.ZodTypeAny, {
        activePatients: number;
        rescheduled: number;
        cancelled: number;
        income: number;
        patientStats: {
            total: number;
            percentage: number;
            months: number;
            chartData: {
                value: number;
                month: string;
            }[];
        };
    }, {
        activePatients: number;
        rescheduled: number;
        cancelled: number;
        income: number;
        patientStats: {
            total: number;
            percentage: number;
            months: number;
            chartData: {
                value: number;
                month: string;
            }[];
        };
    }>;
    upcomingAppointments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        patientId: z.ZodString;
        patientName: z.ZodString;
        time: z.ZodString;
        date: z.ZodString;
        type: z.ZodString;
        status: z.ZodEnum<["scheduled", "confirmed", "cancelled", "completed"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed";
        date: string;
        time: string;
        patientId: string;
        patientName: string;
    }, {
        id: string;
        type: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed";
        date: string;
        time: string;
        patientId: string;
        patientName: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    therapist: {
        id: string;
        name: string;
        avatar: string;
    };
    stats: {
        activePatients: number;
        rescheduled: number;
        cancelled: number;
        income: number;
        patientStats: {
            total: number;
            percentage: number;
            months: number;
            chartData: {
                value: number;
                month: string;
            }[];
        };
    };
    upcomingAppointments: {
        id: string;
        type: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed";
        date: string;
        time: string;
        patientId: string;
        patientName: string;
    }[];
}, {
    therapist: {
        id: string;
        name: string;
        avatar: string;
    };
    stats: {
        activePatients: number;
        rescheduled: number;
        cancelled: number;
        income: number;
        patientStats: {
            total: number;
            percentage: number;
            months: number;
            chartData: {
                value: number;
                month: string;
            }[];
        };
    };
    upcomingAppointments: {
        id: string;
        type: string;
        status: "cancelled" | "scheduled" | "confirmed" | "completed";
        date: string;
        time: string;
        patientId: string;
        patientName: string;
    }[];
}>;
export declare const PatientDataSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    fullName: z.ZodString;
    avatar: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    age: z.ZodNumber;
    diagnosis: z.ZodString;
    treatmentPlan: z.ZodString;
    currentSession: z.ZodNumber;
    totalSessions: z.ZodNumber;
    sessions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        date: z.ZodString;
        duration: z.ZodNumber;
        notes: z.ZodString;
        type: z.ZodEnum<["initial", "follow-up", "crisis", "final"]>;
        status: z.ZodEnum<["scheduled", "completed", "cancelled", "no-show"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "initial" | "follow-up" | "crisis" | "final";
        status: "cancelled" | "scheduled" | "completed" | "no-show";
        date: string;
        duration: number;
        notes: string;
    }, {
        id: string;
        type: "initial" | "follow-up" | "crisis" | "final";
        status: "cancelled" | "scheduled" | "completed" | "no-show";
        date: string;
        duration: number;
        notes: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    name: string;
    avatar: string;
    fullName: string;
    phone: string;
    age: number;
    diagnosis: string;
    treatmentPlan: string;
    currentSession: number;
    totalSessions: number;
    sessions: {
        id: string;
        type: "initial" | "follow-up" | "crisis" | "final";
        status: "cancelled" | "scheduled" | "completed" | "no-show";
        date: string;
        duration: number;
        notes: string;
    }[];
}, {
    id: string;
    email: string;
    name: string;
    avatar: string;
    fullName: string;
    phone: string;
    age: number;
    diagnosis: string;
    treatmentPlan: string;
    currentSession: number;
    totalSessions: number;
    sessions: {
        id: string;
        type: "initial" | "follow-up" | "crisis" | "final";
        status: "cancelled" | "scheduled" | "completed" | "no-show";
        date: string;
        duration: number;
        notes: string;
    }[];
}>;
export declare const PersonalInfoSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    middleName: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodString;
    birthDate: z.ZodString;
    address: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zipCode: z.ZodString;
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    address: string;
    phone: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    middleName?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    address: string;
    phone: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    middleName?: string | undefined;
}>;
export declare const EducationSchema: z.ZodObject<{
    degree: z.ZodString;
    institution: z.ZodString;
    graduationYear: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    degree: string;
    institution: string;
    graduationYear: number;
}, {
    degree: string;
    institution: string;
    graduationYear: number;
}>;
export declare const CertificationSchema: z.ZodObject<{
    name: z.ZodString;
    issuingOrganization: z.ZodString;
    issueDate: z.ZodString;
    expirationDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expirationDate?: string | undefined;
}, {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expirationDate?: string | undefined;
}>;
export declare const ProfessionalInfoSchema: z.ZodObject<{
    licenseNumber: z.ZodString;
    licenseState: z.ZodString;
    licenseExpiration: z.ZodString;
    specialties: z.ZodArray<z.ZodString, "many">;
    yearsOfExperience: z.ZodNumber;
    education: z.ZodArray<z.ZodObject<{
        degree: z.ZodString;
        institution: z.ZodString;
        graduationYear: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        degree: string;
        institution: string;
        graduationYear: number;
    }, {
        degree: string;
        institution: string;
        graduationYear: number;
    }>, "many">;
    certifications: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        issuingOrganization: z.ZodString;
        issueDate: z.ZodString;
        expirationDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        issuingOrganization: string;
        issueDate: string;
        expirationDate?: string | undefined;
    }, {
        name: string;
        issuingOrganization: string;
        issueDate: string;
        expirationDate?: string | undefined;
    }>, "many">;
    languages: z.ZodArray<z.ZodString, "many">;
    bio: z.ZodString;
    approach: z.ZodString;
}, "strip", z.ZodTypeAny, {
    specialties: string[];
    bio: string;
    licenseNumber: string;
    licenseState: string;
    licenseExpiration: string;
    yearsOfExperience: number;
    education: {
        degree: string;
        institution: string;
        graduationYear: number;
    }[];
    certifications: {
        name: string;
        issuingOrganization: string;
        issueDate: string;
        expirationDate?: string | undefined;
    }[];
    languages: string[];
    approach: string;
}, {
    specialties: string[];
    bio: string;
    licenseNumber: string;
    licenseState: string;
    licenseExpiration: string;
    yearsOfExperience: number;
    education: {
        degree: string;
        institution: string;
        graduationYear: number;
    }[];
    certifications: {
        name: string;
        issuingOrganization: string;
        issueDate: string;
        expirationDate?: string | undefined;
    }[];
    languages: string[];
    approach: string;
}>;
export declare const SessionFormatSchema: z.ZodEnum<["in-person", "video", "phone"]>;
export declare const PracticeInfoSchema: z.ZodObject<{
    sessionFormats: z.ZodArray<z.ZodEnum<["in-person", "video", "phone"]>, "many">;
    availability: z.ZodObject<{
        timezone: z.ZodString;
        schedule: z.ZodRecord<z.ZodString, z.ZodObject<{
            isAvailable: z.ZodBoolean;
            startTime: z.ZodOptional<z.ZodString>;
            endTime: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            isAvailable: boolean;
            startTime?: string | undefined;
            endTime?: string | undefined;
        }, {
            isAvailable: boolean;
            startTime?: string | undefined;
            endTime?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        schedule: Record<string, {
            isAvailable: boolean;
            startTime?: string | undefined;
            endTime?: string | undefined;
        }>;
    }, {
        timezone: string;
        schedule: Record<string, {
            isAvailable: boolean;
            startTime?: string | undefined;
            endTime?: string | undefined;
        }>;
    }>;
    pricing: z.ZodObject<{
        sessionFee: z.ZodNumber;
        currency: z.ZodString;
        acceptsInsurance: z.ZodBoolean;
        insuranceProviders: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        sessionFee: number;
        currency: string;
        acceptsInsurance: boolean;
        insuranceProviders?: string[] | undefined;
    }, {
        sessionFee: number;
        currency: string;
        acceptsInsurance: boolean;
        insuranceProviders?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    availability: {
        timezone: string;
        schedule: Record<string, {
            isAvailable: boolean;
            startTime?: string | undefined;
            endTime?: string | undefined;
        }>;
    };
    sessionFormats: ("phone" | "in-person" | "video")[];
    pricing: {
        sessionFee: number;
        currency: string;
        acceptsInsurance: boolean;
        insuranceProviders?: string[] | undefined;
    };
}, {
    availability: {
        timezone: string;
        schedule: Record<string, {
            isAvailable: boolean;
            startTime?: string | undefined;
            endTime?: string | undefined;
        }>;
    };
    sessionFormats: ("phone" | "in-person" | "video")[];
    pricing: {
        sessionFee: number;
        currency: string;
        acceptsInsurance: boolean;
        insuranceProviders?: string[] | undefined;
    };
}>;
export declare const TherapistApplicationDtoSchema: z.ZodObject<{
    personalInfo: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        middleName: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodString;
        birthDate: z.ZodString;
        address: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    }>;
    professionalInfo: z.ZodObject<{
        licenseNumber: z.ZodString;
        licenseState: z.ZodString;
        licenseExpiration: z.ZodString;
        specialties: z.ZodArray<z.ZodString, "many">;
        yearsOfExperience: z.ZodNumber;
        education: z.ZodArray<z.ZodObject<{
            degree: z.ZodString;
            institution: z.ZodString;
            graduationYear: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            degree: string;
            institution: string;
            graduationYear: number;
        }, {
            degree: string;
            institution: string;
            graduationYear: number;
        }>, "many">;
        certifications: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            issuingOrganization: z.ZodString;
            issueDate: z.ZodString;
            expirationDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }, {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }>, "many">;
        languages: z.ZodArray<z.ZodString, "many">;
        bio: z.ZodString;
        approach: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    }, {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    }>;
    practiceInfo: z.ZodObject<{
        sessionFormats: z.ZodArray<z.ZodEnum<["in-person", "video", "phone"]>, "many">;
        availability: z.ZodObject<{
            timezone: z.ZodString;
            schedule: z.ZodRecord<z.ZodString, z.ZodObject<{
                isAvailable: z.ZodBoolean;
                startTime: z.ZodOptional<z.ZodString>;
                endTime: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        }, {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        }>;
        pricing: z.ZodObject<{
            sessionFee: z.ZodNumber;
            currency: z.ZodString;
            acceptsInsurance: z.ZodBoolean;
            insuranceProviders: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        }, {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    }, {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    personalInfo: {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    };
    professionalInfo: {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    };
    practiceInfo: {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    };
}, {
    personalInfo: {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    };
    professionalInfo: {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    };
    practiceInfo: {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    };
}>;
export declare const ApplicationStatusSchema: z.ZodEnum<["pending", "under_review", "approved", "rejected", "additional_info_required"]>;
export declare const ApplicationDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    filename: z.ZodString;
    originalName: z.ZodString;
    url: z.ZodString;
    fileType: z.ZodEnum<["resume", "license", "certification", "transcript", "other"]>;
    uploadedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    url: string;
    filename: string;
    originalName: string;
    fileType: "resume" | "license" | "certification" | "transcript" | "other";
    uploadedAt: string;
}, {
    id: string;
    url: string;
    filename: string;
    originalName: string;
    fileType: "resume" | "license" | "certification" | "transcript" | "other";
    uploadedAt: string;
}>;
export declare const TherapistApplicationSchema: z.ZodObject<{
    id: z.ZodString;
    applicantId: z.ZodString;
    applicant: z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    }, {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    }>;
    personalInfo: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        middleName: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodString;
        birthDate: z.ZodString;
        address: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    }>;
    professionalInfo: z.ZodObject<{
        licenseNumber: z.ZodString;
        licenseState: z.ZodString;
        licenseExpiration: z.ZodString;
        specialties: z.ZodArray<z.ZodString, "many">;
        yearsOfExperience: z.ZodNumber;
        education: z.ZodArray<z.ZodObject<{
            degree: z.ZodString;
            institution: z.ZodString;
            graduationYear: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            degree: string;
            institution: string;
            graduationYear: number;
        }, {
            degree: string;
            institution: string;
            graduationYear: number;
        }>, "many">;
        certifications: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            issuingOrganization: z.ZodString;
            issueDate: z.ZodString;
            expirationDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }, {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }>, "many">;
        languages: z.ZodArray<z.ZodString, "many">;
        bio: z.ZodString;
        approach: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    }, {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    }>;
    practiceInfo: z.ZodObject<{
        sessionFormats: z.ZodArray<z.ZodEnum<["in-person", "video", "phone"]>, "many">;
        availability: z.ZodObject<{
            timezone: z.ZodString;
            schedule: z.ZodRecord<z.ZodString, z.ZodObject<{
                isAvailable: z.ZodBoolean;
                startTime: z.ZodOptional<z.ZodString>;
                endTime: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        }, {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        }>;
        pricing: z.ZodObject<{
            sessionFee: z.ZodNumber;
            currency: z.ZodString;
            acceptsInsurance: z.ZodBoolean;
            insuranceProviders: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        }, {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    }, {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    }>;
    status: z.ZodEnum<["pending", "under_review", "approved", "rejected", "additional_info_required"]>;
    submittedAt: z.ZodString;
    reviewedAt: z.ZodOptional<z.ZodString>;
    reviewedBy: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
    }, {
        id: string;
        firstName: string;
        lastName: string;
    }>>;
    adminNotes: z.ZodOptional<z.ZodString>;
    rejectionReason: z.ZodOptional<z.ZodString>;
    documents: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        originalName: z.ZodString;
        url: z.ZodString;
        fileType: z.ZodEnum<["resume", "license", "certification", "transcript", "other"]>;
        uploadedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        url: string;
        filename: string;
        originalName: string;
        fileType: "resume" | "license" | "certification" | "transcript" | "other";
        uploadedAt: string;
    }, {
        id: string;
        url: string;
        filename: string;
        originalName: string;
        fileType: "resume" | "license" | "certification" | "transcript" | "other";
        uploadedAt: string;
    }>, "many">;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    status: "pending" | "under_review" | "approved" | "rejected" | "additional_info_required";
    personalInfo: {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    };
    professionalInfo: {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    };
    practiceInfo: {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    };
    applicantId: string;
    applicant: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    submittedAt: string;
    documents: {
        id: string;
        url: string;
        filename: string;
        originalName: string;
        fileType: "resume" | "license" | "certification" | "transcript" | "other";
        uploadedAt: string;
    }[];
    reviewedAt?: string | undefined;
    reviewedBy?: {
        id: string;
        firstName: string;
        lastName: string;
    } | undefined;
    adminNotes?: string | undefined;
    rejectionReason?: string | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    status: "pending" | "under_review" | "approved" | "rejected" | "additional_info_required";
    personalInfo: {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    };
    professionalInfo: {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    };
    practiceInfo: {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    };
    applicantId: string;
    applicant: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    submittedAt: string;
    documents: {
        id: string;
        url: string;
        filename: string;
        originalName: string;
        fileType: "resume" | "license" | "certification" | "transcript" | "other";
        uploadedAt: string;
    }[];
    reviewedAt?: string | undefined;
    reviewedBy?: {
        id: string;
        firstName: string;
        lastName: string;
    } | undefined;
    adminNotes?: string | undefined;
    rejectionReason?: string | undefined;
}>;
export declare const ApplicationStatusUpdateDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "under_review", "approved", "rejected", "additional_info_required"]>;
    adminNotes: z.ZodOptional<z.ZodString>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "under_review" | "approved" | "rejected" | "additional_info_required";
    adminNotes?: string | undefined;
    rejectionReason?: string | undefined;
}, {
    status: "pending" | "under_review" | "approved" | "rejected" | "additional_info_required";
    adminNotes?: string | undefined;
    rejectionReason?: string | undefined;
}>;
export declare const CreateApplicationRequestSchema: z.ZodObject<{
    personalInfo: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        middleName: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodString;
        birthDate: z.ZodString;
        address: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    }>;
    professionalInfo: z.ZodObject<{
        licenseNumber: z.ZodString;
        licenseState: z.ZodString;
        licenseExpiration: z.ZodString;
        specialties: z.ZodArray<z.ZodString, "many">;
        yearsOfExperience: z.ZodNumber;
        education: z.ZodArray<z.ZodObject<{
            degree: z.ZodString;
            institution: z.ZodString;
            graduationYear: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            degree: string;
            institution: string;
            graduationYear: number;
        }, {
            degree: string;
            institution: string;
            graduationYear: number;
        }>, "many">;
        certifications: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            issuingOrganization: z.ZodString;
            issueDate: z.ZodString;
            expirationDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }, {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }>, "many">;
        languages: z.ZodArray<z.ZodString, "many">;
        bio: z.ZodString;
        approach: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    }, {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    }>;
    practiceInfo: z.ZodObject<{
        sessionFormats: z.ZodArray<z.ZodEnum<["in-person", "video", "phone"]>, "many">;
        availability: z.ZodObject<{
            timezone: z.ZodString;
            schedule: z.ZodRecord<z.ZodString, z.ZodObject<{
                isAvailable: z.ZodBoolean;
                startTime: z.ZodOptional<z.ZodString>;
                endTime: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        }, {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        }>;
        pricing: z.ZodObject<{
            sessionFee: z.ZodNumber;
            currency: z.ZodString;
            acceptsInsurance: z.ZodBoolean;
            insuranceProviders: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        }, {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    }, {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    personalInfo: {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    };
    professionalInfo: {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    };
    practiceInfo: {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    };
}, {
    personalInfo: {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    };
    professionalInfo: {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    };
    practiceInfo: {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    };
}>;
export declare const UpdateApplicationRequestSchema: z.ZodObject<{
    personalInfo: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        middleName: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodString;
        birthDate: z.ZodString;
        address: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    }>>;
    professionalInfo: z.ZodOptional<z.ZodObject<{
        licenseNumber: z.ZodString;
        licenseState: z.ZodString;
        licenseExpiration: z.ZodString;
        specialties: z.ZodArray<z.ZodString, "many">;
        yearsOfExperience: z.ZodNumber;
        education: z.ZodArray<z.ZodObject<{
            degree: z.ZodString;
            institution: z.ZodString;
            graduationYear: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            degree: string;
            institution: string;
            graduationYear: number;
        }, {
            degree: string;
            institution: string;
            graduationYear: number;
        }>, "many">;
        certifications: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            issuingOrganization: z.ZodString;
            issueDate: z.ZodString;
            expirationDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }, {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }>, "many">;
        languages: z.ZodArray<z.ZodString, "many">;
        bio: z.ZodString;
        approach: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    }, {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    }>>;
    practiceInfo: z.ZodOptional<z.ZodObject<{
        sessionFormats: z.ZodArray<z.ZodEnum<["in-person", "video", "phone"]>, "many">;
        availability: z.ZodObject<{
            timezone: z.ZodString;
            schedule: z.ZodRecord<z.ZodString, z.ZodObject<{
                isAvailable: z.ZodBoolean;
                startTime: z.ZodOptional<z.ZodString>;
                endTime: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        }, {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        }>;
        pricing: z.ZodObject<{
            sessionFee: z.ZodNumber;
            currency: z.ZodString;
            acceptsInsurance: z.ZodBoolean;
            insuranceProviders: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        }, {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    }, {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    personalInfo?: {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    } | undefined;
    professionalInfo?: {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    } | undefined;
    practiceInfo?: {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    } | undefined;
}, {
    personalInfo?: {
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        address: string;
        phone: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        middleName?: string | undefined;
    } | undefined;
    professionalInfo?: {
        specialties: string[];
        bio: string;
        licenseNumber: string;
        licenseState: string;
        licenseExpiration: string;
        yearsOfExperience: number;
        education: {
            degree: string;
            institution: string;
            graduationYear: number;
        }[];
        certifications: {
            name: string;
            issuingOrganization: string;
            issueDate: string;
            expirationDate?: string | undefined;
        }[];
        languages: string[];
        approach: string;
    } | undefined;
    practiceInfo?: {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("phone" | "in-person" | "video")[];
        pricing: {
            sessionFee: number;
            currency: string;
            acceptsInsurance: boolean;
            insuranceProviders?: string[] | undefined;
        };
    } | undefined;
}>;
export declare const ApplicationListParamsSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "under_review", "approved", "rejected", "additional_info_required"]>>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodEnum<["submittedAt", "status", "lastName"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "under_review" | "approved" | "rejected" | "additional_info_required" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "lastName" | "status" | "submittedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}, {
    status?: "pending" | "under_review" | "approved" | "rejected" | "additional_info_required" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "lastName" | "status" | "submittedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const WorksheetAssignmentSchema: z.ZodObject<{
    id: z.ZodString;
    worksheetId: z.ZodString;
    patientId: z.ZodString;
    therapistId: z.ZodString;
    assignedAt: z.ZodString;
    dueDate: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["assigned", "in_progress", "completed", "overdue"]>;
    instructions: z.ZodOptional<z.ZodString>;
    feedback: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "completed" | "assigned" | "in_progress" | "overdue";
    patientId: string;
    worksheetId: string;
    therapistId: string;
    assignedAt: string;
    dueDate?: string | undefined;
    instructions?: string | undefined;
    feedback?: string | undefined;
}, {
    id: string;
    status: "completed" | "assigned" | "in_progress" | "overdue";
    patientId: string;
    worksheetId: string;
    therapistId: string;
    assignedAt: string;
    dueDate?: string | undefined;
    instructions?: string | undefined;
    feedback?: string | undefined;
}>;
export declare const TherapistCredentialsSchema: z.ZodObject<{
    id: z.ZodString;
    therapistId: z.ZodString;
    licenseNumber: z.ZodString;
    licenseType: z.ZodString;
    issuingState: z.ZodString;
    issueDate: z.ZodString;
    expirationDate: z.ZodString;
    isActive: z.ZodBoolean;
    isVerified: z.ZodBoolean;
    verifiedAt: z.ZodOptional<z.ZodString>;
    verifiedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    licenseNumber: string;
    licenseType: string;
    isVerified: boolean;
    isActive: boolean;
    issueDate: string;
    expirationDate: string;
    therapistId: string;
    issuingState: string;
    verifiedAt?: string | undefined;
    verifiedBy?: string | undefined;
}, {
    id: string;
    licenseNumber: string;
    licenseType: string;
    isVerified: boolean;
    isActive: boolean;
    issueDate: string;
    expirationDate: string;
    therapistId: string;
    issuingState: string;
    verifiedAt?: string | undefined;
    verifiedBy?: string | undefined;
}>;
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
//# sourceMappingURL=therapist.d.ts.map