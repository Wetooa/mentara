import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const MeetingCountOutputTypeSelectSchema: z.ZodType<Prisma.MeetingCountOutputTypeSelect> = z.object({
  reviews: z.boolean().optional(),
}).strict();

export default MeetingCountOutputTypeSelectSchema;
