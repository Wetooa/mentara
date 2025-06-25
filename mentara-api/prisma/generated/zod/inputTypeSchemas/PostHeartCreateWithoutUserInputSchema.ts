import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateNestedOneWithoutHeartsInputSchema } from './PostCreateNestedOneWithoutHeartsInputSchema';

export const PostHeartCreateWithoutUserInputSchema: z.ZodType<Prisma.PostHeartCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  post: z.lazy(() => PostCreateNestedOneWithoutHeartsInputSchema)
}).strict();

export default PostHeartCreateWithoutUserInputSchema;
