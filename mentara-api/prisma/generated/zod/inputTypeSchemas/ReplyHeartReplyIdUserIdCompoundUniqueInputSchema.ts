import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ReplyHeartReplyIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.ReplyHeartReplyIdUserIdCompoundUniqueInput> = z.object({
  replyId: z.string(),
  userId: z.string()
}).strict();

export default ReplyHeartReplyIdUserIdCompoundUniqueInputSchema;
