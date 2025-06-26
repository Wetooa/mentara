import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewClientIdTherapistIdMeetingIdCompoundUniqueInputSchema } from './ReviewClientIdTherapistIdMeetingIdCompoundUniqueInputSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumReviewStatusFilterSchema } from './EnumReviewStatusFilterSchema';
import { ReviewStatusSchema } from './ReviewStatusSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { TherapistScalarRelationFilterSchema } from './TherapistScalarRelationFilterSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { MeetingNullableScalarRelationFilterSchema } from './MeetingNullableScalarRelationFilterSchema';
import { MeetingWhereInputSchema } from './MeetingWhereInputSchema';
import { ReviewHelpfulListRelationFilterSchema } from './ReviewHelpfulListRelationFilterSchema';

export const ReviewWhereUniqueInputSchema: z.ZodType<Prisma.ReviewWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    clientId_therapistId_meetingId: z.lazy(() => ReviewClientIdTherapistIdMeetingIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    clientId_therapistId_meetingId: z.lazy(() => ReviewClientIdTherapistIdMeetingIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  clientId_therapistId_meetingId: z.lazy(() => ReviewClientIdTherapistIdMeetingIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ReviewWhereInputSchema),z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewWhereInputSchema),z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  rating: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  title: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  content: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isAnonymous: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  meetingId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumReviewStatusFilterSchema),z.lazy(() => ReviewStatusSchema) ]).optional(),
  moderatedBy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  moderatedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  moderationNote: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isVerified: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  helpfulCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
  therapist: z.union([ z.lazy(() => TherapistScalarRelationFilterSchema),z.lazy(() => TherapistWhereInputSchema) ]).optional(),
  meeting: z.union([ z.lazy(() => MeetingNullableScalarRelationFilterSchema),z.lazy(() => MeetingWhereInputSchema) ]).optional().nullable(),
  helpfulVotes: z.lazy(() => ReviewHelpfulListRelationFilterSchema).optional()
}).strict());

export default ReviewWhereUniqueInputSchema;
