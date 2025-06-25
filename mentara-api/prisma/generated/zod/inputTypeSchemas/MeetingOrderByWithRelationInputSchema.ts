import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ClientOrderByWithRelationInputSchema } from './ClientOrderByWithRelationInputSchema';
import { TherapistOrderByWithRelationInputSchema } from './TherapistOrderByWithRelationInputSchema';
import { MeetingDurationOrderByWithRelationInputSchema } from './MeetingDurationOrderByWithRelationInputSchema';

export const MeetingOrderByWithRelationInputSchema: z.ZodType<Prisma.MeetingOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  startTime: z.lazy(() => SortOrderSchema).optional(),
  endTime: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  meetingType: z.lazy(() => SortOrderSchema).optional(),
  meetingUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  therapistId: z.lazy(() => SortOrderSchema).optional(),
  durationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  client: z.lazy(() => ClientOrderByWithRelationInputSchema).optional(),
  therapist: z.lazy(() => TherapistOrderByWithRelationInputSchema).optional(),
  durationConfig: z.lazy(() => MeetingDurationOrderByWithRelationInputSchema).optional()
}).strict();

export default MeetingOrderByWithRelationInputSchema;
