import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateNestedManyWithoutPostInputSchema } from './CommentCreateNestedManyWithoutPostInputSchema';
import { PostHeartCreateNestedManyWithoutPostInputSchema } from './PostHeartCreateNestedManyWithoutPostInputSchema';
import { UserCreateNestedOneWithoutPostsInputSchema } from './UserCreateNestedOneWithoutPostsInputSchema';
import { RoomCreateNestedOneWithoutPostsInputSchema } from './RoomCreateNestedOneWithoutPostsInputSchema';

export const PostCreateWithoutFilesInputSchema: z.ZodType<Prisma.PostCreateWithoutFilesInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutPostInputSchema).optional(),
  hearts: z.lazy(() => PostHeartCreateNestedManyWithoutPostInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutPostsInputSchema).optional(),
  room: z.lazy(() => RoomCreateNestedOneWithoutPostsInputSchema).optional()
}).strict();

export default PostCreateWithoutFilesInputSchema;
