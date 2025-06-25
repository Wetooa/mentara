import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { PostFileUpdateManyWithoutPostNestedInputSchema } from './PostFileUpdateManyWithoutPostNestedInputSchema';
import { CommentUpdateManyWithoutPostNestedInputSchema } from './CommentUpdateManyWithoutPostNestedInputSchema';
import { PostHeartUpdateManyWithoutPostNestedInputSchema } from './PostHeartUpdateManyWithoutPostNestedInputSchema';
import { UserUpdateOneWithoutPostsNestedInputSchema } from './UserUpdateOneWithoutPostsNestedInputSchema';
import { RoomUpdateOneWithoutPostsNestedInputSchema } from './RoomUpdateOneWithoutPostsNestedInputSchema';

export const PostUpdateInputSchema: z.ZodType<Prisma.PostUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  files: z.lazy(() => PostFileUpdateManyWithoutPostNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutPostNestedInputSchema).optional(),
  hearts: z.lazy(() => PostHeartUpdateManyWithoutPostNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneWithoutPostsNestedInputSchema).optional(),
  room: z.lazy(() => RoomUpdateOneWithoutPostsNestedInputSchema).optional()
}).strict();

export default PostUpdateInputSchema;
