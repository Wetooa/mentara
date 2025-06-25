import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReplyFileCreateManyInputSchema: z.ZodType<Prisma.ReplyFileCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  replyId: z.string(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default ReplyFileCreateManyInputSchema;
