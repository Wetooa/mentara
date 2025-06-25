import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const PostHeartPostIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.PostHeartPostIdUserIdCompoundUniqueInput> = z.object({
  postId: z.string(),
  userId: z.string()
}).strict();

export default PostHeartPostIdUserIdCompoundUniqueInputSchema;
