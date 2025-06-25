import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileUncheckedCreateNestedManyWithoutPostInputSchema } from './PostFileUncheckedCreateNestedManyWithoutPostInputSchema';
import { CommentUncheckedCreateNestedManyWithoutPostInputSchema } from './CommentUncheckedCreateNestedManyWithoutPostInputSchema';
import { PostHeartUncheckedCreateNestedManyWithoutPostInputSchema } from './PostHeartUncheckedCreateNestedManyWithoutPostInputSchema';

export const PostUncheckedCreateWithoutRoomInputSchema: z.ZodType<Prisma.PostUncheckedCreateWithoutRoomInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable(),
  files: z.lazy(() => PostFileUncheckedCreateNestedManyWithoutPostInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutPostInputSchema).optional(),
  hearts: z.lazy(() => PostHeartUncheckedCreateNestedManyWithoutPostInputSchema).optional()
}).strict();

export default PostUncheckedCreateWithoutRoomInputSchema;
