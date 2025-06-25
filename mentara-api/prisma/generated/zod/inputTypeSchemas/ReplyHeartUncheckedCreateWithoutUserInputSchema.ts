import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReplyHeartUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ReplyHeartUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  replyId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default ReplyHeartUncheckedCreateWithoutUserInputSchema;
