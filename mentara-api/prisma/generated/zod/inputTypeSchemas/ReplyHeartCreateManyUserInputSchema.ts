import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReplyHeartCreateManyUserInputSchema: z.ZodType<Prisma.ReplyHeartCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  replyId: z.string(),
  createdAt: z.coerce.date().optional()
}).strict();

export default ReplyHeartCreateManyUserInputSchema;
