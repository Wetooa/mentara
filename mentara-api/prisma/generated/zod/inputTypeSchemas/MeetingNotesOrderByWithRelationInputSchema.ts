import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { MeetingOrderByWithRelationInputSchema } from './MeetingOrderByWithRelationInputSchema';

export const MeetingNotesOrderByWithRelationInputSchema: z.ZodType<Prisma.MeetingNotesOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  meetingId: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  meeting: z.lazy(() => MeetingOrderByWithRelationInputSchema).optional()
}).strict();

export default MeetingNotesOrderByWithRelationInputSchema;
