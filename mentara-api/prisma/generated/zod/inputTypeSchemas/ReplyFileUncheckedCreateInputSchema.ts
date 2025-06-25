import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReplyFileUncheckedCreateInputSchema: z.ZodType<Prisma.ReplyFileUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  replyId: z.string(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default ReplyFileUncheckedCreateInputSchema;
