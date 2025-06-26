import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileUncheckedCreateNestedManyWithoutPostInputSchema } from './PostFileUncheckedCreateNestedManyWithoutPostInputSchema';
import { CommentUncheckedCreateNestedManyWithoutPostInputSchema } from './CommentUncheckedCreateNestedManyWithoutPostInputSchema';

export const PostUncheckedCreateWithoutHeartsInputSchema: z.ZodType<Prisma.PostUncheckedCreateWithoutHeartsInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  files: z.lazy(() => PostFileUncheckedCreateNestedManyWithoutPostInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutPostInputSchema).optional()
}).strict();

export default PostUncheckedCreateWithoutHeartsInputSchema;
