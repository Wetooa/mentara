import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReplyHeartUncheckedCreateWithoutReplyInputSchema: z.ZodType<Prisma.ReplyHeartUncheckedCreateWithoutReplyInput> = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default ReplyHeartUncheckedCreateWithoutReplyInputSchema;
