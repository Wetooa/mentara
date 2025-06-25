import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutPostHeartsInputSchema } from './UserCreateNestedOneWithoutPostHeartsInputSchema';

export const PostHeartCreateWithoutPostInputSchema: z.ZodType<Prisma.PostHeartCreateWithoutPostInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutPostHeartsInputSchema).optional()
}).strict();

export default PostHeartCreateWithoutPostInputSchema;
