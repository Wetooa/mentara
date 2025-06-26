import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MeetingNotesWhereInputSchema } from './MeetingNotesWhereInputSchema';

export const MeetingNotesListRelationFilterSchema: z.ZodType<Prisma.MeetingNotesListRelationFilter> = z.object({
  every: z.lazy(() => MeetingNotesWhereInputSchema).optional(),
  some: z.lazy(() => MeetingNotesWhereInputSchema).optional(),
  none: z.lazy(() => MeetingNotesWhereInputSchema).optional()
}).strict();

export default MeetingNotesListRelationFilterSchema;
