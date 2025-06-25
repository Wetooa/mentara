import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyFileSelectSchema } from '../inputTypeSchemas/ReplyFileSelectSchema';
import { ReplyFileIncludeSchema } from '../inputTypeSchemas/ReplyFileIncludeSchema';

export const ReplyFileArgsSchema: z.ZodType<Prisma.ReplyFileDefaultArgs> = z.object({
  select: z.lazy(() => ReplyFileSelectSchema).optional(),
  include: z.lazy(() => ReplyFileIncludeSchema).optional(),
}).strict();

export default ReplyFileArgsSchema;
