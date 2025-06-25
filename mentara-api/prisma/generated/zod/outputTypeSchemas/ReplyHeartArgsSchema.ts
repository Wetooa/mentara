import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyHeartSelectSchema } from '../inputTypeSchemas/ReplyHeartSelectSchema';
import { ReplyHeartIncludeSchema } from '../inputTypeSchemas/ReplyHeartIncludeSchema';

export const ReplyHeartArgsSchema: z.ZodType<Prisma.ReplyHeartDefaultArgs> = z.object({
  select: z.lazy(() => ReplyHeartSelectSchema).optional(),
  include: z.lazy(() => ReplyHeartIncludeSchema).optional(),
}).strict();

export default ReplyHeartArgsSchema;
