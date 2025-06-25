import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationCountOutputTypeSelectSchema } from './MeetingDurationCountOutputTypeSelectSchema';

export const MeetingDurationCountOutputTypeArgsSchema: z.ZodType<Prisma.MeetingDurationCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => MeetingDurationCountOutputTypeSelectSchema).nullish(),
}).strict();

export default MeetingDurationCountOutputTypeSelectSchema;
