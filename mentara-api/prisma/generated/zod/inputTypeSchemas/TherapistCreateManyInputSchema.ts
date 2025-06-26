import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';

export const TherapistCreateManyInputSchema: z.ZodType<Prisma.TherapistCreateManyInput> = z.object({
  userId: z.string(),
  approved: z.boolean().optional(),
  status: z.string().optional(),
  submissionDate: z.coerce.date().optional(),
  processingDate: z.coerce.date().optional().nullable(),
  processedBy: z.string().optional().nullable(),
  applicationData: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  mobile: z.string(),
  province: z.string(),
  providerType: z.string(),
  professionalLicenseType: z.string(),
  isPRCLicensed: z.string(),
  prcLicenseNumber: z.string(),
  expirationDateOfLicense: z.coerce.date().optional().nullable(),
  isLicenseActive: z.string(),
  practiceStartDate: z.coerce.date(),
  yearsOfExperience: z.string().optional().nullable(),
  areasOfExpertise: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  assessmentTools: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  therapeuticApproachesUsedList: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  languagesOffered: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  providedOnlineTherapyBefore: z.string(),
  comfortableUsingVideoConferencing: z.string(),
  weeklyAvailability: z.string(),
  preferredSessionLength: z.string(),
  accepts: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  privateConfidentialSpace: z.string().optional().nullable(),
  compliesWithDataPrivacyAct: z.string().optional().nullable(),
  professionalLiabilityInsurance: z.string().optional().nullable(),
  complaintsOrDisciplinaryActions: z.string().optional().nullable(),
  willingToAbideByPlatformGuidelines: z.string().optional().nullable(),
  expertise: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  approaches: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  languages: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  illnessSpecializations: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  acceptTypes: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  treatmentSuccessRates: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  uploadedFiles: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  sessionLength: z.string().optional().nullable(),
  hourlyRate: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  bio: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
  profileComplete: z.boolean().optional(),
  isActive: z.boolean().optional(),
  patientSatisfaction: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  totalPatients: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default TherapistCreateManyInputSchema;
