import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { WorksheetListRelationFilterSchema } from './WorksheetListRelationFilterSchema';
import { PreAssessmentNullableScalarRelationFilterSchema } from './PreAssessmentNullableScalarRelationFilterSchema';
import { PreAssessmentWhereInputSchema } from './PreAssessmentWhereInputSchema';
import { WorksheetSubmissionListRelationFilterSchema } from './WorksheetSubmissionListRelationFilterSchema';
import { ClientMedicalHistoryListRelationFilterSchema } from './ClientMedicalHistoryListRelationFilterSchema';
import { ClientPreferenceListRelationFilterSchema } from './ClientPreferenceListRelationFilterSchema';
import { ClientTherapistListRelationFilterSchema } from './ClientTherapistListRelationFilterSchema';
import { MeetingListRelationFilterSchema } from './MeetingListRelationFilterSchema';

export const ClientWhereUniqueInputSchema: z.ZodType<Prisma.ClientWhereUniqueInput> = z.object({
  userId: z.string()
})
.and(z.object({
  userId: z.string().optional(),
  AND: z.union([ z.lazy(() => ClientWhereInputSchema),z.lazy(() => ClientWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ClientWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ClientWhereInputSchema),z.lazy(() => ClientWhereInputSchema).array() ]).optional(),
  hasSeenTherapistRecommendations: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  worksheets: z.lazy(() => WorksheetListRelationFilterSchema).optional(),
  preAssessment: z.union([ z.lazy(() => PreAssessmentNullableScalarRelationFilterSchema),z.lazy(() => PreAssessmentWhereInputSchema) ]).optional().nullable(),
  worksheetSubmissions: z.lazy(() => WorksheetSubmissionListRelationFilterSchema).optional(),
  clientMedicalHistory: z.lazy(() => ClientMedicalHistoryListRelationFilterSchema).optional(),
  clientPreferences: z.lazy(() => ClientPreferenceListRelationFilterSchema).optional(),
  assignedTherapists: z.lazy(() => ClientTherapistListRelationFilterSchema).optional(),
  meetings: z.lazy(() => MeetingListRelationFilterSchema).optional()
}).strict());

export default ClientWhereUniqueInputSchema;
