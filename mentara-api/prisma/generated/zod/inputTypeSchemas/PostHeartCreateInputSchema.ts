import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateNestedOneWithoutHeartsInputSchema } from './PostCreateNestedOneWithoutHeartsInputSchema';
import { UserCreateNestedOneWithoutPostHeartsInputSchema } from './UserCreateNestedOneWithoutPostHeartsInputSchema';

export const PostHeartCreateInputSchema: z.ZodType<Prisma.PostHeartCreateInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  post: z.lazy(() => PostCreateNestedOneWithoutHeartsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutPostHeartsInputSchema).optional()
}).strict();

export default PostHeartCreateInputSchema;
