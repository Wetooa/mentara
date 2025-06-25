import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReplyCountOutputTypeSelectSchema } from './ReplyCountOutputTypeSelectSchema';

export const ReplyCountOutputTypeArgsSchema: z.ZodType<Prisma.ReplyCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ReplyCountOutputTypeSelectSchema).nullish(),
}).strict();

export default ReplyCountOutputTypeSelectSchema;
