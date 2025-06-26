import { z } from 'zod';

export const TherapistScalarFieldEnumSchema = z.enum(['userId','mobile','province','status','submissionDate','processingDate','processedByAdminId','providerType','professionalLicenseType','isPRCLicensed','prcLicenseNumber','expirationDateOfLicense','practiceStartDate','areasOfExpertise','assessmentTools','therapeuticApproachesUsedList','languagesOffered','providedOnlineTherapyBefore','comfortableUsingVideoConferencing','preferredSessionLength','privateConfidentialSpace','compliesWithDataPrivacyAct','professionalLiabilityInsurance','complaintsOrDisciplinaryActions','willingToAbideByPlatformGuidelines','expertise','approaches','languages','illnessSpecializations','acceptTypes','treatmentSuccessRates','sessionLength','hourlyRate','createdAt','updatedAt']);

export default TherapistScalarFieldEnumSchema;
