import { z } from 'zod';

export const TherapistScalarFieldEnumSchema = z.enum(['userId','approved','status','submissionDate','processingDate','processedBy','applicationData','firstName','lastName','email','mobile','province','providerType','professionalLicenseType','isPRCLicensed','prcLicenseNumber','expirationDateOfLicense','isLicenseActive','practiceStartDate','areasOfExpertise','assessmentTools','therapeuticApproachesUsedList','languagesOffered','providedOnlineTherapyBefore','comfortableUsingVideoConferencing','weeklyAvailability','preferredSessionLength','accepts','sessionLength','hourlyRate','expertise','approaches','languages','illnessSpecializations','acceptTypes','treatmentSuccessRates','uploadedFiles','bio','profileImageUrl','profileComplete','isActive','createdAt','updatedAt']);

export default TherapistScalarFieldEnumSchema;
