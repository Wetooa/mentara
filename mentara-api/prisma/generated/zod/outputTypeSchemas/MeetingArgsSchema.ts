import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingSelectSchema } from '../inputTypeSchemas/MeetingSelectSchema';
import { MeetingIncludeSchema } from '../inputTypeSchemas/MeetingIncludeSchema';

export const MeetingArgsSchema: z.ZodType<Prisma.MeetingDefaultArgs> = z.object({
  select: z.lazy(() => MeetingSelectSchema).optional(),
  include: z.lazy(() => MeetingIncludeSchema).optional(),
}).strict();

export default MeetingArgsSchema;
