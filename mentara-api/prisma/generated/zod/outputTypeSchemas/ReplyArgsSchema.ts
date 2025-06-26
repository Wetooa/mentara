import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplySelectSchema } from '../inputTypeSchemas/ReplySelectSchema';
import { ReplyIncludeSchema } from '../inputTypeSchemas/ReplyIncludeSchema';

export const ReplyArgsSchema: z.ZodType<Prisma.ReplyDefaultArgs> = z.object({
  select: z.lazy(() => ReplySelectSchema).optional(),
  include: z.lazy(() => ReplyIncludeSchema).optional(),
}).strict();

export default ReplyArgsSchema;
