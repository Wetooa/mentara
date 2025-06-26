import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateNestedOneWithoutHeartsInputSchema } from './CommentCreateNestedOneWithoutHeartsInputSchema';

export const CommentHeartCreateWithoutUserInputSchema: z.ZodType<Prisma.CommentHeartCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  comment: z.lazy(() => CommentCreateNestedOneWithoutHeartsInputSchema)
}).strict();

export default CommentHeartCreateWithoutUserInputSchema;
