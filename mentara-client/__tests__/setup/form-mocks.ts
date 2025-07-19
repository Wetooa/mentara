// Mock data generators for all form types in Mentara

// Therapist Application Form Mock Data
export const therapistApplicationMockData = {
  valid: {
    // Basic Information
    firstName: 'Dr. Maria',
    lastName: 'Santos',
    mobile: '09123456789',
    email: 'maria.santos@example.com',
    province: 'Metro Manila',
    providerType: 'Clinical Psychologist',

    // Professional License Information
    professionalLicenseType: 'licensed-psychologist',
    professionalLicenseType_specify: '',
    isPRCLicensed: 'yes',
    prcLicenseNumber: '1234567',
    expirationDateOfLicense: '2025-12-31',
    isLicenseActive: 'yes',

    // Practice Information
    practiceStartDate: '2020-01-01',
    yearsOfExperience: 5,
    educationBackground: 'PhD in Clinical Psychology from University of the Philippines, specialized in cognitive behavioral therapy and trauma counseling.',
    practiceLocation: 'Quezon City, Metro Manila',

    // Teletherapy Readiness
    providedOnlineTherapyBefore: 'yes',
    comfortableUsingVideoConferencing: 'yes',
    privateConfidentialSpace: 'yes',
    compliesWithDataPrivacyAct: 'yes',

    // Areas of Expertise and Tools
    areasOfExpertise: ['anxiety', 'depression', 'trauma'],
    assessmentTools: ['phq-9', 'gad-7', 'beck-inventory'],
    therapeuticApproachesUsedList: ['cbt', 'dbt', 'mindfulness'],
    therapeuticApproachesUsedList_specify: '',

    // Languages and Availability
    languagesOffered: ['english', 'filipino'],
    languagesOffered_specify: '',
    weeklyAvailability: '20-30',
    preferredSessionLength: '50-minutes',
    preferredSessionLength_specify: '',

    // Payment and Rates
    accepts: ['private-pay', 'insurance'],
    accepts_hmo_specify: '',
    hourlyRate: 2000,

    // Insurance Information
    acceptsInsurance: true,
    acceptedInsuranceTypes: ['hmo-a', 'hmo-b'],
    sessionDuration: 50,

    // Bio/About
    bio: 'Experienced clinical psychologist specializing in anxiety and depression treatment using evidence-based approaches.',

    // Compliance
    professionalLiabilityInsurance: 'yes',
    complaintsOrDisciplinaryActions: 'no',
    complaintsOrDisciplinaryActions_specify: '',
    willingToAbideByPlatformGuidelines: 'yes',

    // Document Upload
    documentsUploaded: {
      prcLicense: true,
      nbiClearance: true,
      resumeCV: true,
    },

    // Consent
    consentChecked: true,
  },

  invalid: {
    // Missing required fields
    missingBasicInfo: {
      firstName: '',
      lastName: '',
      mobile: '',
      email: 'invalid-email',
      province: '',
      providerType: '',
    },

    // Invalid license information
    invalidLicense: {
      isPRCLicensed: 'yes',
      prcLicenseNumber: '123', // Too short
      expirationDateOfLicense: '',
      isLicenseActive: '',
    },

    // Invalid arrays
    invalidArrays: {
      areasOfExpertise: [], // Empty array
      assessmentTools: [],
      therapeuticApproachesUsedList: [],
      languagesOffered: [],
      accepts: [],
    },

    // Invalid conditional fields
    invalidConditional: {
      professionalLicenseType: 'other',
      professionalLicenseType_specify: '', // Required when 'other'
      therapeuticApproachesUsedList: ['other'],
      therapeuticApproachesUsedList_specify: '', // Required when 'other'
    },

    // Invalid consent
    invalidConsent: {
      willingToAbideByPlatformGuidelines: 'no',
      consentChecked: false,
    },
  },
}

// User Onboarding Forms Mock Data
export const userOnboardingMockData = {
  profile: {
    valid: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      phoneNumber: '09123456789',
      address: '123 Main Street, Barangay 1',
      city: 'Quezon City',
      state: 'Metro Manila',
      zipCode: '1100',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '09987654321',
      emergencyContactRelationship: 'spouse',
      medicalHistory: 'No significant medical history',
      currentMedications: 'None',
      allergies: 'None known',
    },
    invalid: {
      firstName: 'J', // Too short
      lastName: '', // Required
      dateOfBirth: '',
      gender: 'invalid',
      phoneNumber: '123', // Too short
      address: '123', // Too short
      city: 'Q', // Too short
      state: 'M', // Too short
      zipCode: '11', // Too short
      emergencyContactName: '', // Required
      emergencyContactPhone: '123', // Too short
      emergencyContactRelationship: '', // Required
    },
  },

  goals: {
    valid: {
      treatmentGoals: ['anxiety', 'depression'],
      specificConcerns: 'Experiencing work-related stress and difficulty sleeping',
      previousTreatment: true,
      previousTreatmentDetails: 'Attended therapy sessions for 6 months in 2022',
      urgencyLevel: 'moderate',
      preferredOutcome: 'I want to develop better coping strategies and improve my overall mental health',
      additionalNotes: 'Prefer morning sessions if possible',
    },
    invalid: {
      treatmentGoals: [], // Empty array
      specificConcerns: '',
      previousTreatment: false,
      previousTreatmentDetails: '',
      urgencyLevel: 'invalid',
      preferredOutcome: 'Short', // Too short
      additionalNotes: '',
    },
  },

  preferences: {
    valid: {
      genderPreference: 'no-preference',
      agePreference: 'similar',
      languagePreferences: ['english', 'filipino'],
      treatmentApproaches: ['cbt', 'dbt'],
      sessionFormat: 'video',
      sessionFrequency: 'weekly',
      budgetRange: '100-150',
      locationPreference: 'Quezon City',
      availabilityPreference: ['morning', 'afternoon'],
      specialConsiderations: 'Prefer therapist with experience in workplace stress',
    },
    invalid: {
      genderPreference: 'invalid',
      agePreference: 'invalid',
      languagePreferences: undefined,
      treatmentApproaches: [], // Empty array
      sessionFormat: 'invalid',
      sessionFrequency: 'invalid',
      budgetRange: 'invalid',
      locationPreference: '',
      availabilityPreference: undefined,
      specialConsiderations: '',
    },
  },
}

// Authentication Forms Mock Data
export const authMockData = {
  signIn: {
    valid: {
      email: 'user@example.com',
      password: 'password123',
    },
    invalid: {
      email: 'invalid-email',
      password: 'short', // Too short
    },
  },

  signUp: {
    valid: {
      nickname: 'John Doe',
      email: 'john@example.com',
      confirmEmail: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    },
    invalid: {
      nickname: 'J', // Too short
      email: 'invalid-email',
      confirmEmail: 'different@example.com', // Doesn't match
      password: 'short', // Too short
      confirmPassword: 'different', // Doesn't match
    },
  },
}

// Review Form Mock Data
export const reviewFormMockData = {
  valid: {
    rating: 5,
    title: 'Excellent therapist',
    content: 'Dr. Smith was very helpful and professional. I felt comfortable discussing my concerns.',
    isAnonymous: false,
  },
  invalid: {
    rating: 0, // Below minimum
    title: '', // Required
    content: 'Short', // Too short
    isAnonymous: false,
  },
}

// Booking/Session Scheduling Mock Data
export const bookingMockData = {
  valid: {
    date: '2024-01-15',
    timeSlot: {
      start: '10:00',
      end: '11:00',
      available: true,
    },
    notes: 'First session, please confirm availability',
    sessionType: 'individual',
    duration: 50,
  },
  invalid: {
    date: '', // Required
    timeSlot: {
      start: '',
      end: '',
      available: false,
    },
    notes: '',
    sessionType: 'invalid',
    duration: 0,
  },
}

// Mock API responses for form submissions
export const mockApiResponses = {
  success: {
    data: {
      id: 'test-id-123',
      message: 'Form submitted successfully',
      status: 'success',
    },
    status: 200,
  },
  
  validation_error: {
    response: {
      data: {
        message: 'Validation failed',
        errors: {
          email: ['Invalid email format'],
          password: ['Password must be at least 8 characters'],
        },
      },
      status: 400,
    },
  },
  
  server_error: {
    response: {
      data: {
        message: 'Internal server error',
        error: 'Database connection failed',
      },
      status: 500,
    },
  },
  
  unauthorized: {
    response: {
      data: {
        message: 'Unauthorized',
        error: 'Invalid credentials',
      },
      status: 401,
    },
  },
}

// Form state mock data
export const formStateMockData = {
  // Form with validation errors
  withErrors: {
    errors: {
      email: { message: 'Invalid email format', type: 'pattern' },
      password: { message: 'Password too short', type: 'minLength' },
    },
    isValid: false,
    isDirty: true,
    isSubmitting: false,
    isSubmitted: true,
  },

  // Form in loading state
  loading: {
    errors: {},
    isValid: true,
    isDirty: true,
    isSubmitting: true,
    isSubmitted: false,
  },

  // Clean form state
  clean: {
    errors: {},
    isValid: true,
    isDirty: false,
    isSubmitting: false,
    isSubmitted: false,
  },
}

// Mock file upload data
export const mockFileUpload = {
  valid: {
    file: new File(['test content'], 'test.pdf', { type: 'application/pdf' }),
    name: 'test.pdf',
    size: 1024,
    type: 'application/pdf',
  },
  invalid: {
    file: new File(['test content'], 'test.txt', { type: 'text/plain' }),
    name: 'test.txt',
    size: 10 * 1024 * 1024, // 10MB - too large
    type: 'text/plain', // Invalid type
  },
}

// Export all mock data
export default {
  therapistApplicationMockData,
  userOnboardingMockData,
  authMockData,
  reviewFormMockData,
  bookingMockData,
  mockApiResponses,
  formStateMockData,
  mockFileUpload,
}