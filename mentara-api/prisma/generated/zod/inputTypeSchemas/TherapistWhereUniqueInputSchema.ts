import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
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
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { AdminNullableScalarRelationFilterSchema } from './AdminNullableScalarRelationFilterSchema';
import { AdminWhereInputSchema } from './AdminWhereInputSchema';
import { MeetingListRelationFilterSchema } from './MeetingListRelationFilterSchema';
import { TherapistAvailabilityListRelationFilterSchema } from './TherapistAvailabilityListRelationFilterSchema';
import { WorksheetListRelationFilterSchema } from './WorksheetListRelationFilterSchema';
import { ClientTherapistListRelationFilterSchema } from './ClientTherapistListRelationFilterSchema';
import { ReviewListRelationFilterSchema } from './ReviewListRelationFilterSchema';
import { TherapistFilesListRelationFilterSchema } from './TherapistFilesListRelationFilterSchema';

export const TherapistWhereUniqueInputSchema: z.ZodType<Prisma.TherapistWhereUniqueInput> = z.object({
  userId: z.string()
})
.and(z.object({
  userId: z.string().optional(),
  AND: z.union([ z.lazy(() => TherapistWhereInputSchema),z.lazy(() => TherapistWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TherapistWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TherapistWhereInputSchema),z.lazy(() => TherapistWhereInputSchema).array() ]).optional(),
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
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  processedByAdmin: z.union([ z.lazy(() => AdminNullableScalarRelationFilterSchema),z.lazy(() => AdminWhereInputSchema) ]).optional().nullable(),
  meetings: z.lazy(() => MeetingListRelationFilterSchema).optional(),
  therapistAvailabilities: z.lazy(() => TherapistAvailabilityListRelationFilterSchema).optional(),
  worksheets: z.lazy(() => WorksheetListRelationFilterSchema).optional(),
  assignedClients: z.lazy(() => ClientTherapistListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  therapistFiles: z.lazy(() => TherapistFilesListRelationFilterSchema).optional()
}).strict());

export default TherapistWhereUniqueInputSchema;
