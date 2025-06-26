import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { IntNullableListFilterSchema } from './IntNullableListFilterSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { DecimalWithAggregatesFilterSchema } from './DecimalWithAggregatesFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';

export const TherapistScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TherapistScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TherapistScalarWhereWithAggregatesInputSchema),z.lazy(() => TherapistScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TherapistScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TherapistScalarWhereWithAggregatesInputSchema),z.lazy(() => TherapistScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  mobile: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  province: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  submissionDate: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  processingDate: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  processedByAdminId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  providerType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  professionalLicenseType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isPRCLicensed: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  prcLicenseNumber: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expirationDateOfLicense: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  practiceStartDate: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
<<<<<<< HEAD
  yearsOfExperience: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  areasOfExpertise: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  assessmentTools: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  therapeuticApproachesUsedList: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  languagesOffered: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  providedOnlineTherapyBefore: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  comfortableUsingVideoConferencing: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  weeklyAvailability: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  preferredSessionLength: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  accepts: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  privateConfidentialSpace: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  compliesWithDataPrivacyAct: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  professionalLiabilityInsurance: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  complaintsOrDisciplinaryActions: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  willingToAbideByPlatformGuidelines: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  expertise: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  approaches: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  languages: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  illnessSpecializations: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  acceptTypes: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  treatmentSuccessRates: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  uploadedFiles: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  sessionLength: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  hourlyRate: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  bio: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  profileImageUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  profileComplete: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  patientSatisfaction: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  totalPatients: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
=======
  areasOfExpertise: z.lazy(() => StringNullableListFilterSchema).optional(),
  assessmentTools: z.lazy(() => StringNullableListFilterSchema).optional(),
  therapeuticApproachesUsedList: z.lazy(() => StringNullableListFilterSchema).optional(),
  languagesOffered: z.lazy(() => StringNullableListFilterSchema).optional(),
  providedOnlineTherapyBefore: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  comfortableUsingVideoConferencing: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  preferredSessionLength: z.lazy(() => IntNullableListFilterSchema).optional(),
  privateConfidentialSpace: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  compliesWithDataPrivacyAct: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  professionalLiabilityInsurance: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  complaintsOrDisciplinaryActions: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  willingToAbideByPlatformGuidelines: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  expertise: z.lazy(() => StringNullableListFilterSchema).optional(),
  approaches: z.lazy(() => StringNullableListFilterSchema).optional(),
  languages: z.lazy(() => StringNullableListFilterSchema).optional(),
  illnessSpecializations: z.lazy(() => StringNullableListFilterSchema).optional(),
  acceptTypes: z.lazy(() => StringNullableListFilterSchema).optional(),
  treatmentSuccessRates: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  sessionLength: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  hourlyRate: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default TherapistScalarWhereWithAggregatesInputSchema;
