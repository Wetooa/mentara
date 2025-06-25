import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentUncheckedCreateNestedManyWithoutPostInputSchema } from './CommentUncheckedCreateNestedManyWithoutPostInputSchema';
import { PostHeartUncheckedCreateNestedManyWithoutPostInputSchema } from './PostHeartUncheckedCreateNestedManyWithoutPostInputSchema';

export const PostUncheckedCreateWithoutFilesInputSchema: z.ZodType<Prisma.PostUncheckedCreateWithoutFilesInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutPostInputSchema).optional(),
  hearts: z.lazy(() => PostHeartUncheckedCreateNestedManyWithoutPostInputSchema).optional()
}).strict();

export default PostUncheckedCreateWithoutFilesInputSchema;
