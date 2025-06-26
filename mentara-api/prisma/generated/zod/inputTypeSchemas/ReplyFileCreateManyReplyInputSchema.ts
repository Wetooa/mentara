import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReplyFileCreateManyReplyInputSchema: z.ZodType<Prisma.ReplyFileCreateManyReplyInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default ReplyFileCreateManyReplyInputSchema;
