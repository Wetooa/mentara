import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const ReplyCountOutputTypeSelectSchema: z.ZodType<Prisma.ReplyCountOutputTypeSelect> = z.object({
  hearts: z.boolean().optional(),
  files: z.boolean().optional(),
}).strict();

export default ReplyCountOutputTypeSelectSchema;
