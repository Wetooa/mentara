export interface TherapistApplication {
  id: string;
  status: "pending" | "approved" | "rejected";
  submissionDate: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense: string;
  isLicenseActive: string;
  providedOnlineTherapyBefore: string;
  comfortableUsingVideoConferencing: string;
  privateConfidentialSpace: string;
  compliesWithDataPrivacyAct: string;
  areasOfExpertise: {
    [key: string]: boolean;
  };
  assessmentTools: {
    [key: string]: boolean;
  };
  yearsOfExperience: string;
  languagesOffered: {
    [key: string]: boolean;
  };
  therapeuticApproachesUsedList: {
    [key: string]: boolean;
  };
  weeklyAvailability: string;
  preferredSessionLength: string;
  accepts: {
    [key: string]: boolean;
  };
  professionalLiabilityInsurance: string;
  complaintsOrDisciplinaryActions: string;
  willingToAbideByPlatformGuidelines: string;
}

export const mockTherapistApplications: TherapistApplication[] = [
  {
    id: "app-001",
    status: "pending",
    submissionDate: "2025-04-15T10:30:00Z",
    firstName: "Tristan James",
    lastName: "Tolentino",
    mobile: "09472546834",
    email: "tristanjamestolentino56@gmail.com",
    province: "Cebu",
    providerType: "Psychologist",
    professionalLicenseType: "rpsy",
    isPRCLicensed: "yes",
    prcLicenseNumber: "9283945",
    expirationDateOfLicense: "2003-09-22",
    isLicenseActive: "yes",
    providedOnlineTherapyBefore: "yes",
    comfortableUsingVideoConferencing: "yes",
    privateConfidentialSpace: "yes",
    compliesWithDataPrivacyAct: "yes",
    areasOfExpertise: {
      stress: true,
    },
    assessmentTools: {
      pss: true,
    },
    yearsOfExperience: "6-10",
    languagesOffered: {
      ilocano: true,
    },
    therapeuticApproachesUsedList: {
      "solution-focused": true,
    },
    weeklyAvailability: "11-20",
    preferredSessionLength: "45",
    accepts: {
      "self-pay": true,
      hmo: false,
    },
    professionalLiabilityInsurance: "yes",
    complaintsOrDisciplinaryActions: "no",
    willingToAbideByPlatformGuidelines: "yes",
  },
  {
    id: "app-002",
    status: "pending",
    submissionDate: "2025-04-20T14:45:00Z",
    firstName: "Maria",
    lastName: "Santos",
    mobile: "09123456789",
    email: "maria.santos@example.com",
    province: "Manila",
    providerType: "Psychiatrist",
    professionalLicenseType: "md",
    isPRCLicensed: "yes",
    prcLicenseNumber: "5647382",
    expirationDateOfLicense: "2026-03-15",
    isLicenseActive: "yes",
    providedOnlineTherapyBefore: "yes",
    comfortableUsingVideoConferencing: "yes",
    privateConfidentialSpace: "yes",
    compliesWithDataPrivacyAct: "yes",
    areasOfExpertise: {
      anxiety: true,
      depression: true,
    },
    assessmentTools: {
      phq9: true,
      gad7: true,
    },
    yearsOfExperience: "11-15",
    languagesOffered: {
      tagalog: true,
      english: true,
    },
    therapeuticApproachesUsedList: {
      "cognitive-behavioral": true,
      humanistic: true,
    },
    weeklyAvailability: "21-30",
    preferredSessionLength: "60",
    accepts: {
      "self-pay": true,
      hmo: true,
    },
    professionalLiabilityInsurance: "yes",
    complaintsOrDisciplinaryActions: "no",
    willingToAbideByPlatformGuidelines: "yes",
  },
  {
    id: "app-003",
    status: "approved",
    submissionDate: "2025-04-10T09:15:00Z",
    firstName: "Jose",
    lastName: "Reyes",
    mobile: "09765432198",
    email: "jose.reyes@example.com",
    province: "Davao",
    providerType: "Clinical Psychologist",
    professionalLicenseType: "rpsy",
    isPRCLicensed: "yes",
    prcLicenseNumber: "3845721",
    expirationDateOfLicense: "2025-11-30",
    isLicenseActive: "yes",
    providedOnlineTherapyBefore: "yes",
    comfortableUsingVideoConferencing: "yes",
    privateConfidentialSpace: "yes",
    compliesWithDataPrivacyAct: "yes",
    areasOfExpertise: {
      trauma: true,
      addiction: true,
    },
    assessmentTools: {
      pcl5: true,
      audit: true,
    },
    yearsOfExperience: "15+",
    languagesOffered: {
      cebuano: true,
      english: true,
    },
    therapeuticApproachesUsedList: {
      emdr: true,
      psychodynamic: true,
    },
    weeklyAvailability: "31+",
    preferredSessionLength: "90",
    accepts: {
      "self-pay": true,
      insurance: true,
    },
    professionalLiabilityInsurance: "yes",
    complaintsOrDisciplinaryActions: "no",
    willingToAbideByPlatformGuidelines: "yes",
  },
];
