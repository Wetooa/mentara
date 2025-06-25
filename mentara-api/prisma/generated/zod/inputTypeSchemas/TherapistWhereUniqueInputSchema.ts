import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DecimalNullableFilterSchema } from './DecimalNullableFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { MeetingListRelationFilterSchema } from './MeetingListRelationFilterSchema';
import { TherapistAvailabilityListRelationFilterSchema } from './TherapistAvailabilityListRelationFilterSchema';
import { WorksheetListRelationFilterSchema } from './WorksheetListRelationFilterSchema';
import { ClientTherapistListRelationFilterSchema } from './ClientTherapistListRelationFilterSchema';

export const TherapistWhereUniqueInputSchema: z.ZodType<Prisma.TherapistWhereUniqueInput> = z.object({
  userId: z.string()
})
.and(z.object({
  userId: z.string().optional(),
  AND: z.union([ z.lazy(() => TherapistWhereInputSchema),z.lazy(() => TherapistWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TherapistWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TherapistWhereInputSchema),z.lazy(() => TherapistWhereInputSchema).array() ]).optional(),
  approved: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  submissionDate: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  processingDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  processedBy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  applicationData: z.lazy(() => JsonNullableFilterSchema).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  mobile: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  province: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  providerType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  professionalLicenseType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isPRCLicensed: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  prcLicenseNumber: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expirationDateOfLicense: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  isLicenseActive: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  practiceStartDate: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  areasOfExpertise: z.lazy(() => JsonFilterSchema).optional(),
  assessmentTools: z.lazy(() => JsonFilterSchema).optional(),
  therapeuticApproachesUsedList: z.lazy(() => JsonFilterSchema).optional(),
  languagesOffered: z.lazy(() => JsonFilterSchema).optional(),
  providedOnlineTherapyBefore: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  comfortableUsingVideoConferencing: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  weeklyAvailability: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  preferredSessionLength: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accepts: z.lazy(() => JsonFilterSchema).optional(),
  sessionLength: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  hourlyRate: z.union([ z.lazy(() => DecimalNullableFilterSchema),z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  expertise: z.lazy(() => JsonNullableFilterSchema).optional(),
  approaches: z.lazy(() => JsonNullableFilterSchema).optional(),
  languages: z.lazy(() => JsonNullableFilterSchema).optional(),
  illnessSpecializations: z.lazy(() => JsonNullableFilterSchema).optional(),
  acceptTypes: z.lazy(() => JsonNullableFilterSchema).optional(),
  treatmentSuccessRates: z.lazy(() => JsonNullableFilterSchema).optional(),
  uploadedFiles: z.lazy(() => JsonNullableFilterSchema).optional(),
  bio: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  profileImageUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  profileComplete: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  meetings: z.lazy(() => MeetingListRelationFilterSchema).optional(),
  therapistAvailabilities: z.lazy(() => TherapistAvailabilityListRelationFilterSchema).optional(),
  worksheets: z.lazy(() => WorksheetListRelationFilterSchema).optional(),
  assignedClients: z.lazy(() => ClientTherapistListRelationFilterSchema).optional()
}).strict());

export default TherapistWhereUniqueInputSchema;
