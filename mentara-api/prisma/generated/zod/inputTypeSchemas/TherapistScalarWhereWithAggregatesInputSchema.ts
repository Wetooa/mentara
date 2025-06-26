import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { JsonNullableWithAggregatesFilterSchema } from './JsonNullableWithAggregatesFilterSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { DecimalNullableWithAggregatesFilterSchema } from './DecimalNullableWithAggregatesFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';

export const TherapistScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TherapistScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TherapistScalarWhereWithAggregatesInputSchema),z.lazy(() => TherapistScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TherapistScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TherapistScalarWhereWithAggregatesInputSchema),z.lazy(() => TherapistScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  approved: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  status: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  submissionDate: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  processingDate: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  processedBy: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  applicationData: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  firstName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  mobile: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  province: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  providerType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  professionalLicenseType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isPRCLicensed: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  prcLicenseNumber: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expirationDateOfLicense: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  isLicenseActive: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  practiceStartDate: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  areasOfExpertise: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  assessmentTools: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  therapeuticApproachesUsedList: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  languagesOffered: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  providedOnlineTherapyBefore: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  comfortableUsingVideoConferencing: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  weeklyAvailability: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  preferredSessionLength: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  accepts: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  sessionLength: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  hourlyRate: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  expertise: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  approaches: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  languages: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  illnessSpecializations: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  acceptTypes: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  treatmentSuccessRates: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  uploadedFiles: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  bio: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  profileImageUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  profileComplete: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default TherapistScalarWhereWithAggregatesInputSchema;
