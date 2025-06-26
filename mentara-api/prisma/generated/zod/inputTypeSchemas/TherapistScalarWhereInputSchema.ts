import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { IntNullableListFilterSchema } from './IntNullableListFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';

export const TherapistScalarWhereInputSchema: z.ZodType<Prisma.TherapistScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TherapistScalarWhereInputSchema),z.lazy(() => TherapistScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TherapistScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TherapistScalarWhereInputSchema),z.lazy(() => TherapistScalarWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  mobile: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  province: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  submissionDate: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  processingDate: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  processedByAdminId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  providerType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  professionalLicenseType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isPRCLicensed: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  prcLicenseNumber: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expirationDateOfLicense: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  practiceStartDate: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  areasOfExpertise: z.lazy(() => StringNullableListFilterSchema).optional(),
  assessmentTools: z.lazy(() => StringNullableListFilterSchema).optional(),
  therapeuticApproachesUsedList: z.lazy(() => StringNullableListFilterSchema).optional(),
  languagesOffered: z.lazy(() => StringNullableListFilterSchema).optional(),
  providedOnlineTherapyBefore: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  comfortableUsingVideoConferencing: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  preferredSessionLength: z.lazy(() => IntNullableListFilterSchema).optional(),
  privateConfidentialSpace: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  compliesWithDataPrivacyAct: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  professionalLiabilityInsurance: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  complaintsOrDisciplinaryActions: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  willingToAbideByPlatformGuidelines: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  expertise: z.lazy(() => StringNullableListFilterSchema).optional(),
  approaches: z.lazy(() => StringNullableListFilterSchema).optional(),
  languages: z.lazy(() => StringNullableListFilterSchema).optional(),
  illnessSpecializations: z.lazy(() => StringNullableListFilterSchema).optional(),
  acceptTypes: z.lazy(() => StringNullableListFilterSchema).optional(),
  treatmentSuccessRates: z.lazy(() => JsonFilterSchema).optional(),
  sessionLength: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  hourlyRate: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default TherapistScalarWhereInputSchema;
