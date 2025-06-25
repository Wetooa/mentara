import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileCreateNestedManyWithoutPostInputSchema } from './PostFileCreateNestedManyWithoutPostInputSchema';
import { CommentCreateNestedManyWithoutPostInputSchema } from './CommentCreateNestedManyWithoutPostInputSchema';
import { PostHeartCreateNestedManyWithoutPostInputSchema } from './PostHeartCreateNestedManyWithoutPostInputSchema';
import { UserCreateNestedOneWithoutPostsInputSchema } from './UserCreateNestedOneWithoutPostsInputSchema';

export const PostCreateWithoutRoomInputSchema: z.ZodType<Prisma.PostCreateWithoutRoomInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  files: z.lazy(() => PostFileCreateNestedManyWithoutPostInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutPostInputSchema).optional(),
  hearts: z.lazy(() => PostHeartCreateNestedManyWithoutPostInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutPostsInputSchema).optional()
}).strict();

export default PostCreateWithoutRoomInputSchema;
