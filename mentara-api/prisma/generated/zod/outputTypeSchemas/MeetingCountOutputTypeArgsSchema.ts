import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingCountOutputTypeSelectSchema } from './MeetingCountOutputTypeSelectSchema';

export const MeetingCountOutputTypeArgsSchema: z.ZodType<Prisma.MeetingCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => MeetingCountOutputTypeSelectSchema).nullish(),
}).strict();

export default MeetingCountOutputTypeSelectSchema;
