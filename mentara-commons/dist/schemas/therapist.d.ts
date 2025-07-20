import { z } from 'zod';
export declare const RegisterTherapistDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    mobile: z.ZodString;
    province: z.ZodString;
    providerType: z.ZodString;
    professionalLicenseType: z.ZodString;
    professionalLicenseType_specify: z.ZodOptional<z.ZodString>;
    isPRCLicensed: z.ZodString;
    prcLicenseNumber: z.ZodOptional<z.ZodString>;
    expirationDateOfLicense: z.ZodOptional<z.ZodString>;
    isLicenseActive: z.ZodOptional<z.ZodString>;
    practiceStartDate: z.ZodString;
    yearsOfExperience: z.ZodOptional<z.ZodNumber>;
    educationBackground: z.ZodOptional<z.ZodString>;
    practiceLocation: z.ZodOptional<z.ZodString>;
    areasOfExpertise: z.ZodArray<z.ZodString, "many">;
    assessmentTools: z.ZodArray<z.ZodString, "many">;
    therapeuticApproachesUsedList: z.ZodArray<z.ZodString, "many">;
    therapeuticApproachesUsedList_specify: z.ZodOptional<z.ZodString>;
    languagesOffered: z.ZodArray<z.ZodString, "many">;
    languagesOffered_specify: z.ZodOptional<z.ZodString>;
    providedOnlineTherapyBefore: z.ZodString;
    comfortableUsingVideoConferencing: z.ZodString;
    privateConfidentialSpace: z.ZodString;
    compliesWithDataPrivacyAct: z.ZodString;
    weeklyAvailability: z.ZodString;
    preferredSessionLength: z.ZodString;
    preferredSessionLength_specify: z.ZodOptional<z.ZodString>;
    accepts: z.ZodArray<z.ZodString, "many">;
    accepts_hmo_specify: z.ZodOptional<z.ZodString>;
    hourlyRate: z.ZodOptional<z.ZodNumber>;
    acceptsInsurance: z.ZodOptional<z.ZodBoolean>;
    acceptedInsuranceTypes: z.ZodOptional<z.ZodString>;
    sessionDuration: z.ZodOptional<z.ZodNumber>;
    bio: z.ZodOptional<z.ZodString>;
    professionalLiabilityInsurance: z.ZodString;
    complaintsOrDisciplinaryActions: z.ZodString;
    complaintsOrDisciplinaryActions_specify: z.ZodOptional<z.ZodString>;
    willingToAbideByPlatformGuidelines: z.ZodString;
    documentsUploaded: z.ZodOptional<z.ZodObject<{
        prcLicense: z.ZodDefault<z.ZodBoolean>;
        nbiClearance: z.ZodDefault<z.ZodBoolean>;
        resumeCV: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        prcLicense: boolean;
        nbiClearance: boolean;
        resumeCV: boolean;
    }, {
        prcLicense?: boolean | undefined;
        nbiClearance?: boolean | undefined;
        resumeCV?: boolean | undefined;
    }>>;
    consentChecked: z.ZodDefault<z.ZodBoolean>;
    profileImageUrl: z.ZodOptional<z.ZodString>;
    applicationData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    weeklyAvailability: string;
    province: string;
    providerType: string;
    mobile: string;
    professionalLicenseType: string;
    isPRCLicensed: string;
    practiceStartDate: string;
    areasOfExpertise: string[];
    assessmentTools: string[];
    therapeuticApproachesUsedList: string[];
    languagesOffered: string[];
    providedOnlineTherapyBefore: string;
    comfortableUsingVideoConferencing: string;
    privateConfidentialSpace: string;
    compliesWithDataPrivacyAct: string;
    preferredSessionLength: string;
    accepts: string[];
    professionalLiabilityInsurance: string;
    complaintsOrDisciplinaryActions: string;
    willingToAbideByPlatformGuidelines: string;
    consentChecked: boolean;
    bio?: string | undefined;
    hourlyRate?: number | undefined;
    sessionDuration?: number | undefined;
    professionalLicenseType_specify?: string | undefined;
    prcLicenseNumber?: string | undefined;
    expirationDateOfLicense?: string | undefined;
    isLicenseActive?: string | undefined;
    yearsOfExperience?: number | undefined;
    educationBackground?: string | undefined;
    practiceLocation?: string | undefined;
    therapeuticApproachesUsedList_specify?: string | undefined;
    languagesOffered_specify?: string | undefined;
    preferredSessionLength_specify?: string | undefined;
    accepts_hmo_specify?: string | undefined;
    acceptsInsurance?: boolean | undefined;
    acceptedInsuranceTypes?: string | undefined;
    complaintsOrDisciplinaryActions_specify?: string | undefined;
    documentsUploaded?: {
        prcLicense: boolean;
        nbiClearance: boolean;
        resumeCV: boolean;
    } | undefined;
    profileImageUrl?: string | undefined;
    applicationData?: Record<string, any> | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    weeklyAvailability: string;
    province: string;
    providerType: string;
    mobile: string;
    professionalLicenseType: string;
    isPRCLicensed: string;
    practiceStartDate: string;
    areasOfExpertise: string[];
    assessmentTools: string[];
    therapeuticApproachesUsedList: string[];
    languagesOffered: string[];
    providedOnlineTherapyBefore: string;
    comfortableUsingVideoConferencing: string;
    privateConfidentialSpace: string;
    compliesWithDataPrivacyAct: string;
    preferredSessionLength: string;
    accepts: string[];
    professionalLiabilityInsurance: string;
    complaintsOrDisciplinaryActions: string;
    willingToAbideByPlatformGuidelines: string;
    bio?: string | undefined;
    hourlyRate?: number | undefined;
    sessionDuration?: number | undefined;
    professionalLicenseType_specify?: string | undefined;
    prcLicenseNumber?: string | undefined;
    expirationDateOfLicense?: string | undefined;
    isLicenseActive?: string | undefined;
    yearsOfExperience?: number | undefined;
    educationBackground?: string | undefined;
    practiceLocation?: string | undefined;
    therapeuticApproachesUsedList_specify?: string | undefined;
    languagesOffered_specify?: string | undefined;
    preferredSessionLength_specify?: string | undefined;
    accepts_hmo_specify?: string | undefined;
    acceptsInsurance?: boolean | undefined;
    acceptedInsuranceTypes?: string | undefined;
    complaintsOrDisciplinaryActions_specify?: string | undefined;
    documentsUploaded?: {
        prcLicense?: boolean | undefined;
        nbiClearance?: boolean | undefined;
        resumeCV?: boolean | undefined;
    } | undefined;
    consentChecked?: boolean | undefined;
    profileImageUrl?: string | undefined;
    applicationData?: Record<string, any> | undefined;
}>;
export declare const UpdateTherapistDtoSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    mobile: z.ZodOptional<z.ZodString>;
    province: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    profileImageUrl: z.ZodOptional<z.ZodString>;
    hourlyRate: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    expertise: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    approaches: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    illnessSpecializations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    bio?: string | undefined;
    isActive?: boolean | undefined;
    hourlyRate?: number | undefined;
    province?: string | undefined;
    mobile?: string | undefined;
    profileImageUrl?: string | undefined;
    expertise?: string[] | undefined;
    approaches?: string[] | undefined;
    languages?: string[] | undefined;
    illnessSpecializations?: string[] | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    bio?: string | undefined;
    isActive?: boolean | undefined;
    hourlyRate?: number | undefined;
    province?: string | undefined;
    mobile?: string | undefined;
    profileImageUrl?: string | undefined;
    expertise?: string[] | undefined;
    approaches?: string[] | undefined;
    languages?: string[] | undefined;
    illnessSpecializations?: string[] | undefined;
}>;
export declare const TherapistRecommendationRequestSchemaLegacy: z.ZodObject<{
    userId: z.ZodString;
    limit: z.ZodOptional<z.ZodNumber>;
    includeInactive: z.ZodOptional<z.ZodBoolean>;
    province: z.ZodOptional<z.ZodString>;
    maxHourlyRate: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    limit?: number | undefined;
    province?: string | undefined;
    includeInactive?: boolean | undefined;
    maxHourlyRate?: number | undefined;
}, {
    userId: string;
    limit?: number | undefined;
    province?: string | undefined;
    includeInactive?: boolean | undefined;
    maxHourlyRate?: number | undefined;
}>;
export declare const TherapistRecommendationResponseDtoSchemaLegacy: z.ZodObject<{
    totalCount: z.ZodNumber;
    userConditions: z.ZodArray<z.ZodString, "many">;
    therapists: z.ZodArray<z.ZodAny, "many">;
    matchCriteria: z.ZodObject<{
        primaryConditions: z.ZodArray<z.ZodString, "many">;
        secondaryConditions: z.ZodArray<z.ZodString, "many">;
        severityLevels: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    }, {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    }>;
    page: z.ZodOptional<z.ZodNumber>;
    pageSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    totalCount: number;
    therapists: any[];
    userConditions: string[];
    matchCriteria: {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    };
    page?: number | undefined;
    pageSize?: number | undefined;
}, {
    totalCount: number;
    therapists: any[];
    userConditions: string[];
    matchCriteria: {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    };
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const TherapistApplicationCreateDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    mobile: z.ZodString;
    province: z.ZodString;
    providerType: z.ZodString;
    professionalLicenseType: z.ZodString;
    isPRCLicensed: z.ZodString;
    prcLicenseNumber: z.ZodOptional<z.ZodString>;
    isLicenseActive: z.ZodOptional<z.ZodString>;
    expirationDateOfLicense: z.ZodOptional<z.ZodString>;
    practiceStartDate: z.ZodString;
    areasOfExpertise: z.ZodArray<z.ZodString, "many">;
    assessmentTools: z.ZodArray<z.ZodString, "many">;
    therapeuticApproachesUsedList: z.ZodArray<z.ZodString, "many">;
    languagesOffered: z.ZodArray<z.ZodString, "many">;
    providedOnlineTherapyBefore: z.ZodBoolean;
    comfortableUsingVideoConferencing: z.ZodBoolean;
    privateConfidentialSpace: z.ZodBoolean;
    compliesWithDataPrivacyAct: z.ZodBoolean;
    weeklyAvailability: z.ZodString;
    preferredSessionLength: z.ZodString;
    accepts: z.ZodArray<z.ZodString, "many">;
    bio: z.ZodOptional<z.ZodString>;
    hourlyRate: z.ZodOptional<z.ZodNumber>;
    professionalLiabilityInsurance: z.ZodString;
    complaintsOrDisciplinaryActions: z.ZodString;
    complaintsOrDisciplinaryActions_specify: z.ZodOptional<z.ZodString>;
    willingToAbideByPlatformGuidelines: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    userId: string;
    weeklyAvailability: string;
    province: string;
    providerType: string;
    mobile: string;
    professionalLicenseType: string;
    isPRCLicensed: string;
    practiceStartDate: string;
    areasOfExpertise: string[];
    assessmentTools: string[];
    therapeuticApproachesUsedList: string[];
    languagesOffered: string[];
    providedOnlineTherapyBefore: boolean;
    comfortableUsingVideoConferencing: boolean;
    privateConfidentialSpace: boolean;
    compliesWithDataPrivacyAct: boolean;
    preferredSessionLength: string;
    accepts: string[];
    professionalLiabilityInsurance: string;
    complaintsOrDisciplinaryActions: string;
    willingToAbideByPlatformGuidelines: boolean;
    bio?: string | undefined;
    hourlyRate?: number | undefined;
    prcLicenseNumber?: string | undefined;
    expirationDateOfLicense?: string | undefined;
    isLicenseActive?: string | undefined;
    complaintsOrDisciplinaryActions_specify?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    userId: string;
    weeklyAvailability: string;
    province: string;
    providerType: string;
    mobile: string;
    professionalLicenseType: string;
    isPRCLicensed: string;
    practiceStartDate: string;
    areasOfExpertise: string[];
    assessmentTools: string[];
    therapeuticApproachesUsedList: string[];
    languagesOffered: string[];
    providedOnlineTherapyBefore: boolean;
    comfortableUsingVideoConferencing: boolean;
    privateConfidentialSpace: boolean;
    compliesWithDataPrivacyAct: boolean;
    preferredSessionLength: string;
    accepts: string[];
    professionalLiabilityInsurance: string;
    complaintsOrDisciplinaryActions: string;
    willingToAbideByPlatformGuidelines: boolean;
    bio?: string | undefined;
    hourlyRate?: number | undefined;
    prcLicenseNumber?: string | undefined;
    expirationDateOfLicense?: string | undefined;
    isLicenseActive?: string | undefined;
    complaintsOrDisciplinaryActions_specify?: string | undefined;
}>;
export declare const TherapistIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const TherapistApplicationIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
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
    firstName: string;
    lastName: string;
    id: string;
    isActive: boolean;
    title: string;
    hourlyRate: number;
    specialties: string[];
    experience: number;
    province: string;
    bio?: string | undefined;
    rating?: number | undefined;
    totalReviews?: number | undefined;
    profileImage?: string | undefined;
    matchScore?: number | undefined;
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
}, {
    firstName: string;
    lastName: string;
    id: string;
    isActive: boolean;
    title: string;
    hourlyRate: number;
    specialties: string[];
    experience: number;
    province: string;
    bio?: string | undefined;
    rating?: number | undefined;
    totalReviews?: number | undefined;
    profileImage?: string | undefined;
    matchScore?: number | undefined;
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
}>;
export declare const MatchCriteriaSchema: z.ZodObject<{
    primaryConditions: z.ZodArray<z.ZodString, "many">;
    secondaryConditions: z.ZodArray<z.ZodString, "many">;
    severityLevels: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    severityLevels: Record<string, string>;
    primaryConditions: string[];
    secondaryConditions: string[];
}, {
    severityLevels: Record<string, string>;
    primaryConditions: string[];
    secondaryConditions: string[];
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
    limit?: number | undefined;
    minRating?: number | undefined;
    offset?: number | undefined;
    specialties?: string[] | undefined;
    province?: string | undefined;
    includeInactive?: boolean | undefined;
    maxHourlyRate?: number | undefined;
}, {
    limit?: number | undefined;
    minRating?: number | undefined;
    offset?: number | undefined;
    specialties?: string[] | undefined;
    province?: string | undefined;
    includeInactive?: boolean | undefined;
    maxHourlyRate?: number | undefined;
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
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        title: string;
        hourlyRate: number;
        specialties: string[];
        experience: number;
        province: string;
        bio?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        profileImage?: string | undefined;
        matchScore?: number | undefined;
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
    }, {
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        title: string;
        hourlyRate: number;
        specialties: string[];
        experience: number;
        province: string;
        bio?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        profileImage?: string | undefined;
        matchScore?: number | undefined;
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
    }>, "many">;
    totalCount: z.ZodNumber;
    userConditions: z.ZodArray<z.ZodString, "many">;
    matchCriteria: z.ZodObject<{
        primaryConditions: z.ZodArray<z.ZodString, "many">;
        secondaryConditions: z.ZodArray<z.ZodString, "many">;
        severityLevels: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    }, {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    }>;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    totalCount: number;
    pageSize: number;
    therapists: {
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        title: string;
        hourlyRate: number;
        specialties: string[];
        experience: number;
        province: string;
        bio?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        profileImage?: string | undefined;
        matchScore?: number | undefined;
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
    }[];
    userConditions: string[];
    matchCriteria: {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    };
}, {
    page: number;
    totalCount: number;
    pageSize: number;
    therapists: {
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        title: string;
        hourlyRate: number;
        specialties: string[];
        experience: number;
        province: string;
        bio?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        profileImage?: string | undefined;
        matchScore?: number | undefined;
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
    }[];
    userConditions: string[];
    matchCriteria: {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    };
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
        cancelled: number;
        activePatients: number;
        rescheduled: number;
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
        cancelled: number;
        activePatients: number;
        rescheduled: number;
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
        type: string;
        status: "scheduled" | "confirmed" | "completed" | "cancelled";
        date: string;
        id: string;
        time: string;
        patientId: string;
        patientName: string;
    }, {
        type: string;
        status: "scheduled" | "confirmed" | "completed" | "cancelled";
        date: string;
        id: string;
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
        cancelled: number;
        activePatients: number;
        rescheduled: number;
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
        type: string;
        status: "scheduled" | "confirmed" | "completed" | "cancelled";
        date: string;
        id: string;
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
        cancelled: number;
        activePatients: number;
        rescheduled: number;
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
        type: string;
        status: "scheduled" | "confirmed" | "completed" | "cancelled";
        date: string;
        id: string;
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
        type: "initial" | "follow-up" | "crisis" | "final";
        status: "scheduled" | "completed" | "cancelled" | "no-show";
        date: string;
        id: string;
        duration: number;
        notes: string;
    }, {
        type: "initial" | "follow-up" | "crisis" | "final";
        status: "scheduled" | "completed" | "cancelled" | "no-show";
        date: string;
        id: string;
        duration: number;
        notes: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    email: string;
    id: string;
    sessions: {
        type: "initial" | "follow-up" | "crisis" | "final";
        status: "scheduled" | "completed" | "cancelled" | "no-show";
        date: string;
        id: string;
        duration: number;
        notes: string;
    }[];
    fullName: string;
    phone: string;
    name: string;
    avatar: string;
    totalSessions: number;
    age: number;
    diagnosis: string;
    treatmentPlan: string;
    currentSession: number;
}, {
    email: string;
    id: string;
    sessions: {
        type: "initial" | "follow-up" | "crisis" | "final";
        status: "scheduled" | "completed" | "cancelled" | "no-show";
        date: string;
        id: string;
        duration: number;
        notes: string;
    }[];
    fullName: string;
    phone: string;
    name: string;
    avatar: string;
    totalSessions: number;
    age: number;
    diagnosis: string;
    treatmentPlan: string;
    currentSession: number;
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
    bio: string;
    specialties: string[];
    licenseNumber: string;
    yearsOfExperience: number;
    languages: string[];
    licenseState: string;
    licenseExpiration: string;
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
    approach: string;
}, {
    bio: string;
    specialties: string[];
    licenseNumber: string;
    yearsOfExperience: number;
    languages: string[];
    licenseState: string;
    licenseExpiration: string;
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
        currency: string;
        acceptsInsurance: boolean;
        sessionFee: number;
        insuranceProviders?: string[] | undefined;
    }, {
        currency: string;
        acceptsInsurance: boolean;
        sessionFee: number;
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
    sessionFormats: ("video" | "phone" | "in-person")[];
    pricing: {
        currency: string;
        acceptsInsurance: boolean;
        sessionFee: number;
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
    sessionFormats: ("video" | "phone" | "in-person")[];
    pricing: {
        currency: string;
        acceptsInsurance: boolean;
        sessionFee: number;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        approach: string;
    }, {
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
            insuranceProviders?: string[] | undefined;
        }, {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
    fileType: "other" | "license" | "resume" | "certification" | "transcript";
    uploadedAt: string;
}, {
    id: string;
    url: string;
    filename: string;
    originalName: string;
    fileType: "other" | "license" | "resume" | "certification" | "transcript";
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
        email: string;
        firstName: string;
        lastName: string;
        id: string;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        id: string;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        approach: string;
    }, {
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
            insuranceProviders?: string[] | undefined;
        }, {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        firstName: string;
        lastName: string;
        id: string;
    }, {
        firstName: string;
        lastName: string;
        id: string;
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
        fileType: "other" | "license" | "resume" | "certification" | "transcript";
        uploadedAt: string;
    }, {
        id: string;
        url: string;
        filename: string;
        originalName: string;
        fileType: "other" | "license" | "resume" | "certification" | "transcript";
        uploadedAt: string;
    }>, "many">;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required";
    id: string;
    createdAt: string;
    updatedAt: string;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        approach: string;
    };
    submittedAt: string;
    practiceInfo: {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
            insuranceProviders?: string[] | undefined;
        };
    };
    applicantId: string;
    applicant: {
        email: string;
        firstName: string;
        lastName: string;
        id: string;
    };
    documents: {
        id: string;
        url: string;
        filename: string;
        originalName: string;
        fileType: "other" | "license" | "resume" | "certification" | "transcript";
        uploadedAt: string;
    }[];
    reviewedAt?: string | undefined;
    reviewedBy?: {
        firstName: string;
        lastName: string;
        id: string;
    } | undefined;
    rejectionReason?: string | undefined;
    adminNotes?: string | undefined;
}, {
    status: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required";
    id: string;
    createdAt: string;
    updatedAt: string;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        approach: string;
    };
    submittedAt: string;
    practiceInfo: {
        availability: {
            timezone: string;
            schedule: Record<string, {
                isAvailable: boolean;
                startTime?: string | undefined;
                endTime?: string | undefined;
            }>;
        };
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
            insuranceProviders?: string[] | undefined;
        };
    };
    applicantId: string;
    applicant: {
        email: string;
        firstName: string;
        lastName: string;
        id: string;
    };
    documents: {
        id: string;
        url: string;
        filename: string;
        originalName: string;
        fileType: "other" | "license" | "resume" | "certification" | "transcript";
        uploadedAt: string;
    }[];
    reviewedAt?: string | undefined;
    reviewedBy?: {
        firstName: string;
        lastName: string;
        id: string;
    } | undefined;
    rejectionReason?: string | undefined;
    adminNotes?: string | undefined;
}>;
export declare const ApplicationStatusUpdateDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "under_review", "approved", "rejected", "additional_info_required"]>;
    adminNotes: z.ZodOptional<z.ZodString>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required";
    rejectionReason?: string | undefined;
    adminNotes?: string | undefined;
}, {
    status: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required";
    rejectionReason?: string | undefined;
    adminNotes?: string | undefined;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        approach: string;
    }, {
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
            insuranceProviders?: string[] | undefined;
        }, {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        approach: string;
    }, {
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
            insuranceProviders?: string[] | undefined;
        }, {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
        bio: string;
        specialties: string[];
        licenseNumber: string;
        yearsOfExperience: number;
        languages: string[];
        licenseState: string;
        licenseExpiration: string;
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
        sessionFormats: ("video" | "phone" | "in-person")[];
        pricing: {
            currency: string;
            acceptsInsurance: boolean;
            sessionFee: number;
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
    status?: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "lastName" | "submittedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}, {
    status?: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "lastName" | "submittedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const TherapistWorksheetAssignmentSchema: z.ZodObject<{
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
    status: "in_progress" | "completed" | "assigned" | "overdue";
    id: string;
    therapistId: string;
    worksheetId: string;
    assignedAt: string;
    patientId: string;
    dueDate?: string | undefined;
    feedback?: string | undefined;
    instructions?: string | undefined;
}, {
    status: "in_progress" | "completed" | "assigned" | "overdue";
    id: string;
    therapistId: string;
    worksheetId: string;
    assignedAt: string;
    patientId: string;
    dueDate?: string | undefined;
    feedback?: string | undefined;
    instructions?: string | undefined;
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
    isVerified: boolean;
    therapistId: string;
    isActive: boolean;
    licenseNumber: string;
    licenseType: string;
    issueDate: string;
    expirationDate: string;
    issuingState: string;
    verifiedAt?: string | undefined;
    verifiedBy?: string | undefined;
}, {
    id: string;
    isVerified: boolean;
    therapistId: string;
    isActive: boolean;
    licenseNumber: string;
    licenseType: string;
    issueDate: string;
    expirationDate: string;
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
export declare const TherapistRecommendationRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    includeInactive: z.ZodDefault<z.ZodBoolean>;
    province: z.ZodOptional<z.ZodString>;
    maxHourlyRate: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    limit: number;
    includeInactive: boolean;
    province?: string | undefined;
    maxHourlyRate?: number | undefined;
}, {
    userId: string;
    limit?: number | undefined;
    province?: string | undefined;
    includeInactive?: boolean | undefined;
    maxHourlyRate?: number | undefined;
}>;
export declare const TherapistRecommendationResponseDtoSchema: z.ZodObject<{
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
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        title: string;
        hourlyRate: number;
        specialties: string[];
        experience: number;
        province: string;
        bio?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        profileImage?: string | undefined;
        matchScore?: number | undefined;
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
    }, {
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        title: string;
        hourlyRate: number;
        specialties: string[];
        experience: number;
        province: string;
        bio?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        profileImage?: string | undefined;
        matchScore?: number | undefined;
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
    }>, "many">;
    totalCount: z.ZodNumber;
    userConditions: z.ZodArray<z.ZodString, "many">;
    matchCriteria: z.ZodObject<{
        primaryConditions: z.ZodArray<z.ZodString, "many">;
        secondaryConditions: z.ZodArray<z.ZodString, "many">;
        severityLevels: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    }, {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    }>;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    totalCount: number;
    pageSize: number;
    therapists: {
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        title: string;
        hourlyRate: number;
        specialties: string[];
        experience: number;
        province: string;
        bio?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        profileImage?: string | undefined;
        matchScore?: number | undefined;
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
    }[];
    userConditions: string[];
    matchCriteria: {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    };
}, {
    page: number;
    totalCount: number;
    pageSize: number;
    therapists: {
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        title: string;
        hourlyRate: number;
        specialties: string[];
        experience: number;
        province: string;
        bio?: string | undefined;
        rating?: number | undefined;
        totalReviews?: number | undefined;
        profileImage?: string | undefined;
        matchScore?: number | undefined;
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
    }[];
    userConditions: string[];
    matchCriteria: {
        severityLevels: Record<string, string>;
        primaryConditions: string[];
        secondaryConditions: string[];
    };
}>;
export declare const WelcomeRecommendationQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    province: z.ZodOptional<z.ZodString>;
    forceRefresh: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    forceRefresh: boolean;
    province?: string | undefined;
}, {
    limit?: number | undefined;
    province?: string | undefined;
    forceRefresh?: boolean | undefined;
}>;
export declare const TherapistRecommendationQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    includeInactive: z.ZodDefault<z.ZodBoolean>;
    province: z.ZodOptional<z.ZodString>;
    maxHourlyRate: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    includeInactive: boolean;
    province?: string | undefined;
    maxHourlyRate?: number | undefined;
}, {
    limit?: number | undefined;
    province?: string | undefined;
    includeInactive?: boolean | undefined;
    maxHourlyRate?: number | undefined;
}>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
export type ApplicationDocument = z.infer<typeof ApplicationDocumentSchema>;
export type ApplicationStatusUpdateDto = z.infer<typeof ApplicationStatusUpdateDtoSchema>;
export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>;
export type UpdateApplicationRequest = z.infer<typeof UpdateApplicationRequestSchema>;
export type ApplicationListParams = z.infer<typeof ApplicationListParamsSchema>;
export type TherapistWorksheetAssignment = z.infer<typeof TherapistWorksheetAssignmentSchema>;
export type TherapistCredentials = z.infer<typeof TherapistCredentialsSchema>;
export type SessionFormat = z.infer<typeof SessionFormatSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export declare const ApplicationListResponseSchema: z.ZodObject<{
    applications: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        applicantId: z.ZodString;
        applicant: z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        }, {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
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
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
            approach: string;
        }, {
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
                insuranceProviders?: string[] | undefined;
            }, {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
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
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
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
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
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
            firstName: string;
            lastName: string;
            id: string;
        }, {
            firstName: string;
            lastName: string;
            id: string;
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
            fileType: "other" | "license" | "resume" | "certification" | "transcript";
            uploadedAt: string;
        }, {
            id: string;
            url: string;
            filename: string;
            originalName: string;
            fileType: "other" | "license" | "resume" | "certification" | "transcript";
            uploadedAt: string;
        }>, "many">;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required";
        id: string;
        createdAt: string;
        updatedAt: string;
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
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
            approach: string;
        };
        submittedAt: string;
        practiceInfo: {
            availability: {
                timezone: string;
                schedule: Record<string, {
                    isAvailable: boolean;
                    startTime?: string | undefined;
                    endTime?: string | undefined;
                }>;
            };
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
                insuranceProviders?: string[] | undefined;
            };
        };
        applicantId: string;
        applicant: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        documents: {
            id: string;
            url: string;
            filename: string;
            originalName: string;
            fileType: "other" | "license" | "resume" | "certification" | "transcript";
            uploadedAt: string;
        }[];
        reviewedAt?: string | undefined;
        reviewedBy?: {
            firstName: string;
            lastName: string;
            id: string;
        } | undefined;
        rejectionReason?: string | undefined;
        adminNotes?: string | undefined;
    }, {
        status: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required";
        id: string;
        createdAt: string;
        updatedAt: string;
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
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
            approach: string;
        };
        submittedAt: string;
        practiceInfo: {
            availability: {
                timezone: string;
                schedule: Record<string, {
                    isAvailable: boolean;
                    startTime?: string | undefined;
                    endTime?: string | undefined;
                }>;
            };
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
                insuranceProviders?: string[] | undefined;
            };
        };
        applicantId: string;
        applicant: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        documents: {
            id: string;
            url: string;
            filename: string;
            originalName: string;
            fileType: "other" | "license" | "resume" | "certification" | "transcript";
            uploadedAt: string;
        }[];
        reviewedAt?: string | undefined;
        reviewedBy?: {
            firstName: string;
            lastName: string;
            id: string;
        } | undefined;
        rejectionReason?: string | undefined;
        adminNotes?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    applications: {
        status: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required";
        id: string;
        createdAt: string;
        updatedAt: string;
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
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
            approach: string;
        };
        submittedAt: string;
        practiceInfo: {
            availability: {
                timezone: string;
                schedule: Record<string, {
                    isAvailable: boolean;
                    startTime?: string | undefined;
                    endTime?: string | undefined;
                }>;
            };
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
                insuranceProviders?: string[] | undefined;
            };
        };
        applicantId: string;
        applicant: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        documents: {
            id: string;
            url: string;
            filename: string;
            originalName: string;
            fileType: "other" | "license" | "resume" | "certification" | "transcript";
            uploadedAt: string;
        }[];
        reviewedAt?: string | undefined;
        reviewedBy?: {
            firstName: string;
            lastName: string;
            id: string;
        } | undefined;
        rejectionReason?: string | undefined;
        adminNotes?: string | undefined;
    }[];
}, {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    applications: {
        status: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required";
        id: string;
        createdAt: string;
        updatedAt: string;
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
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
            approach: string;
        };
        submittedAt: string;
        practiceInfo: {
            availability: {
                timezone: string;
                schedule: Record<string, {
                    isAvailable: boolean;
                    startTime?: string | undefined;
                    endTime?: string | undefined;
                }>;
            };
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
                insuranceProviders?: string[] | undefined;
            };
        };
        applicantId: string;
        applicant: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        documents: {
            id: string;
            url: string;
            filename: string;
            originalName: string;
            fileType: "other" | "license" | "resume" | "certification" | "transcript";
            uploadedAt: string;
        }[];
        reviewedAt?: string | undefined;
        reviewedBy?: {
            firstName: string;
            lastName: string;
            id: string;
        } | undefined;
        rejectionReason?: string | undefined;
        adminNotes?: string | undefined;
    }[];
}>;
export declare const SubmitApplicationWithDocumentsRequestSchema: z.ZodObject<{
    application: z.ZodObject<{
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
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
            approach: string;
        }, {
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
                insuranceProviders?: string[] | undefined;
            }, {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
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
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
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
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
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
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
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
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
                insuranceProviders?: string[] | undefined;
            };
        };
    }>;
    files: z.ZodArray<z.ZodAny, "many">;
    fileTypes: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    files: any[];
    application: {
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
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
                insuranceProviders?: string[] | undefined;
            };
        };
    };
    fileTypes: Record<string, string>;
}, {
    files: any[];
    application: {
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
            bio: string;
            specialties: string[];
            licenseNumber: string;
            yearsOfExperience: number;
            languages: string[];
            licenseState: string;
            licenseExpiration: string;
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
            sessionFormats: ("video" | "phone" | "in-person")[];
            pricing: {
                currency: string;
                acceptsInsurance: boolean;
                sessionFee: number;
                insuranceProviders?: string[] | undefined;
            };
        };
    };
    fileTypes: Record<string, string>;
}>;
export declare const SubmitApplicationResponseSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<["pending", "under_review", "approved", "rejected"]>;
    submittedAt: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
    nextSteps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "approved" | "rejected" | "pending" | "under_review";
    id: string;
    submittedAt: string;
    message?: string | undefined;
    nextSteps?: string[] | undefined;
}, {
    status: "approved" | "rejected" | "pending" | "under_review";
    id: string;
    submittedAt: string;
    message?: string | undefined;
    nextSteps?: string[] | undefined;
}>;
export declare const ApplicationStatusUpdateResponseSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<["pending", "under_review", "approved", "rejected"]>;
    updatedAt: z.ZodString;
    updatedBy: z.ZodString;
    adminNotes: z.ZodOptional<z.ZodString>;
    notificationSent: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status: "approved" | "rejected" | "pending" | "under_review";
    id: string;
    updatedAt: string;
    updatedBy: string;
    notificationSent: boolean;
    adminNotes?: string | undefined;
}, {
    status: "approved" | "rejected" | "pending" | "under_review";
    id: string;
    updatedAt: string;
    updatedBy: string;
    adminNotes?: string | undefined;
    notificationSent?: boolean | undefined;
}>;
export type RegisterTherapistDto = z.infer<typeof RegisterTherapistDtoSchema>;
export type UpdateTherapistDto = z.infer<typeof UpdateTherapistDtoSchema>;
export type TherapistRecommendationRequest = z.infer<typeof TherapistRecommendationRequestSchema>;
export type TherapistRecommendationResponseDto = z.infer<typeof TherapistRecommendationResponseDtoSchema>;
export type TherapistApplicationCreateDto = z.infer<typeof TherapistApplicationCreateDtoSchema>;
export type TherapistIdParam = z.infer<typeof TherapistIdParamSchema>;
export type TherapistApplicationIdParam = z.infer<typeof TherapistApplicationIdParamSchema>;
export type WelcomeRecommendationQuery = z.infer<typeof WelcomeRecommendationQuerySchema>;
export type TherapistRecommendationQuery = z.infer<typeof TherapistRecommendationQuerySchema>;
export type ApplicationListResponse = z.infer<typeof ApplicationListResponseSchema>;
export type SubmitApplicationWithDocumentsRequest = z.infer<typeof SubmitApplicationWithDocumentsRequestSchema>;
export type SubmitApplicationResponse = z.infer<typeof SubmitApplicationResponseSchema>;
export type ApplicationStatusUpdateResponse = z.infer<typeof ApplicationStatusUpdateResponseSchema>;
export declare const TherapistWorksheetQueryDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["assigned", "in_progress", "completed", "overdue"]>>;
    clientId: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "in_progress" | "completed" | "assigned" | "overdue" | undefined;
    clientId?: string | undefined;
}, {
    status?: "in_progress" | "completed" | "assigned" | "overdue" | undefined;
    limit?: number | undefined;
    clientId?: string | undefined;
    offset?: number | undefined;
}>;
export declare const TherapistMeetingQueryDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["scheduled", "in_progress", "completed", "cancelled", "no_show"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show" | undefined;
}, {
    status?: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const TherapistClientRequestQueryDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "accepted", "declined", "expired"]>>;
    priority: z.ZodOptional<z.ZodEnum<["high", "medium", "low"]>>;
    dateRange: z.ZodOptional<z.ZodEnum<["today", "week", "month", "all"]>>;
    sortBy: z.ZodOptional<z.ZodEnum<["newest", "oldest", "priority", "match_score"]>>;
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "pending" | "accepted" | "declined" | "expired" | undefined;
    sortBy?: "priority" | "newest" | "oldest" | "match_score" | undefined;
    priority?: "high" | "medium" | "low" | undefined;
    search?: string | undefined;
    dateRange?: "month" | "week" | "today" | "all" | undefined;
}, {
    status?: "pending" | "accepted" | "declined" | "expired" | undefined;
    limit?: number | undefined;
    sortBy?: "priority" | "newest" | "oldest" | "match_score" | undefined;
    priority?: "high" | "medium" | "low" | undefined;
    offset?: number | undefined;
    search?: string | undefined;
    dateRange?: "month" | "week" | "today" | "all" | undefined;
}>;
export declare const TherapistApplicationListDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "under_review", "approved", "rejected", "additional_info_required"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodEnum<["submittedAt", "status", "lastName"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required" | undefined;
    sortBy?: "status" | "lastName" | "submittedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}, {
    status?: "approved" | "rejected" | "pending" | "under_review" | "additional_info_required" | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "lastName" | "submittedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    offset?: number | undefined;
}>;
export type TherapistWorksheetQueryDto = z.infer<typeof TherapistWorksheetQueryDtoSchema>;
export type TherapistMeetingQueryDto = z.infer<typeof TherapistMeetingQueryDtoSchema>;
export type TherapistClientRequestQueryDto = z.infer<typeof TherapistClientRequestQueryDtoSchema>;
export type TherapistApplicationListDto = z.infer<typeof TherapistApplicationListDtoSchema>;
export declare const ALLOWED_DOCUMENT_MIME_TYPES: readonly ["application/pdf", "image/jpeg", "image/png", "image/jpg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
export declare const MAX_DOCUMENT_SIZE: number;
export declare const REQUIRED_DOCUMENT_TYPES: {
    readonly prcLicense: "PRC License";
    readonly nbiClearance: "NBI Clearance";
    readonly resumeCV: "Resume/CV";
};
export declare const OPTIONAL_DOCUMENT_TYPES: {
    readonly liabilityInsurance: "Professional Liability Insurance";
    readonly birForm: "BIR Form";
};
export declare const ALL_DOCUMENT_TYPES: {
    readonly liabilityInsurance: "Professional Liability Insurance";
    readonly birForm: "BIR Form";
    readonly prcLicense: "PRC License";
    readonly nbiClearance: "NBI Clearance";
    readonly resumeCV: "Resume/CV";
};
export declare const DOCUMENT_TYPE_MAPPING: {
    readonly prcLicense: "license";
    readonly nbiClearance: "certificate";
    readonly resumeCV: "resume";
    readonly liabilityInsurance: "certificate";
    readonly birForm: "document";
};
export type DocumentType = keyof typeof ALL_DOCUMENT_TYPES;
export type RequiredDocumentType = keyof typeof REQUIRED_DOCUMENT_TYPES;
export type BackendDocumentCategory = typeof DOCUMENT_TYPE_MAPPING[DocumentType];
export declare const FileValidationSchema: z.ZodObject<{
    name: z.ZodString;
    size: z.ZodNumber;
    type: z.ZodEnum<["application/pdf", "image/jpeg", "image/png", "image/jpg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]>;
}, "strip", z.ZodTypeAny, {
    type: "application/pdf" | "image/jpeg" | "image/png" | "image/jpg" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    name: string;
    size: number;
}, {
    type: "application/pdf" | "image/jpeg" | "image/png" | "image/jpg" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    name: string;
    size: number;
}>;
export declare const DocumentUploadSchema: z.ZodObject<{
    type: z.ZodEnum<["prcLicense" | "nbiClearance" | "resumeCV" | "liabilityInsurance" | "birForm", ...("prcLicense" | "nbiClearance" | "resumeCV" | "liabilityInsurance" | "birForm")[]]>;
    file: z.ZodObject<{
        name: z.ZodString;
        size: z.ZodNumber;
        type: z.ZodEnum<["application/pdf", "image/jpeg", "image/png", "image/jpg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]>;
    }, "strip", z.ZodTypeAny, {
        type: "application/pdf" | "image/jpeg" | "image/png" | "image/jpg" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        name: string;
        size: number;
    }, {
        type: "application/pdf" | "image/jpeg" | "image/png" | "image/jpg" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        name: string;
        size: number;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "prcLicense" | "nbiClearance" | "resumeCV" | "liabilityInsurance" | "birForm";
    file: {
        type: "application/pdf" | "image/jpeg" | "image/png" | "image/jpg" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        name: string;
        size: number;
    };
}, {
    type: "prcLicense" | "nbiClearance" | "resumeCV" | "liabilityInsurance" | "birForm";
    file: {
        type: "application/pdf" | "image/jpeg" | "image/png" | "image/jpg" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        name: string;
        size: number;
    };
}>;
export declare const RegisterTherapistWithDocumentsRequestSchema: z.ZodObject<{
    applicationDataJson: z.ZodString;
    fileTypes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    applicationDataJson: string;
    fileTypes?: string | undefined;
}, {
    applicationDataJson: string;
    fileTypes?: string | undefined;
}>;
export declare const DocumentValidationUtils: {
    /**
     * Validates if a file type is allowed
     */
    isValidFileType: (mimeType: string) => boolean;
    /**
     * Validates if a file size is within limits
     */
    isValidFileSize: (size: number) => boolean;
    /**
     * Gets the backend category for a document type
     */
    getBackendCategory: (documentType: DocumentType) => BackendDocumentCategory;
    /**
     * Validates that all required documents are present
     */
    validateRequiredDocuments: (documentTypes: string[]) => {
        isValid: boolean;
        missing: string[];
    };
    /**
     * Gets display name for document type
     */
    getDocumentDisplayName: (documentType: DocumentType) => string;
};
export type FileValidation = z.infer<typeof FileValidationSchema>;
export type DocumentUpload = z.infer<typeof DocumentUploadSchema>;
export type RegisterTherapistWithDocumentsRequest = z.infer<typeof RegisterTherapistWithDocumentsRequestSchema>;
//# sourceMappingURL=therapist.d.ts.map