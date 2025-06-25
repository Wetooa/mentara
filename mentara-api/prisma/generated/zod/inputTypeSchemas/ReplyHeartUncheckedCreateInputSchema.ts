import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReplyHeartUncheckedCreateInputSchema: z.ZodType<Prisma.ReplyHeartUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  replyId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default ReplyHeartUncheckedCreateInputSchema;
