import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const MeetingDurationCountOutputTypeSelectSchema: z.ZodType<Prisma.MeetingDurationCountOutputTypeSelect> = z.object({
  meetings: z.boolean().optional(),
}).strict();

export default MeetingDurationCountOutputTypeSelectSchema;
