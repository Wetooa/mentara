import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationSelectSchema } from '../inputTypeSchemas/MeetingDurationSelectSchema';
import { MeetingDurationIncludeSchema } from '../inputTypeSchemas/MeetingDurationIncludeSchema';

export const MeetingDurationArgsSchema: z.ZodType<Prisma.MeetingDurationDefaultArgs> = z.object({
  select: z.lazy(() => MeetingDurationSelectSchema).optional(),
  include: z.lazy(() => MeetingDurationIncludeSchema).optional(),
}).strict();

export default MeetingDurationArgsSchema;
