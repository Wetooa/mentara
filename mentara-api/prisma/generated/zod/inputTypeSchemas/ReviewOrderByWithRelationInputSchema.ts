import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ClientOrderByWithRelationInputSchema } from './ClientOrderByWithRelationInputSchema';
import { TherapistOrderByWithRelationInputSchema } from './TherapistOrderByWithRelationInputSchema';
import { MeetingOrderByWithRelationInputSchema } from './MeetingOrderByWithRelationInputSchema';
import { ReviewHelpfulOrderByRelationAggregateInputSchema } from './ReviewHelpfulOrderByRelationAggregateInputSchema';

export const ReviewOrderByWithRelationInputSchema: z.ZodType<Prisma.ReviewOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  rating: z.lazy(() => SortOrderSchema).optional(),
  title: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  content: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isAnonymous: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  therapistId: z.lazy(() => SortOrderSchema).optional(),
  meetingId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  moderatedBy: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  moderatedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  moderationNote: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isVerified: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  client: z.lazy(() => ClientOrderByWithRelationInputSchema).optional(),
  therapist: z.lazy(() => TherapistOrderByWithRelationInputSchema).optional(),
  meeting: z.lazy(() => MeetingOrderByWithRelationInputSchema).optional(),
  helpfulVotes: z.lazy(() => ReviewHelpfulOrderByRelationAggregateInputSchema).optional()
}).strict();

export default ReviewOrderByWithRelationInputSchema;
