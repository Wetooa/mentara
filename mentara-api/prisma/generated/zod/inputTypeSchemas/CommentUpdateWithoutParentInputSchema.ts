import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { PostUpdateOneRequiredWithoutCommentsNestedInputSchema } from './PostUpdateOneRequiredWithoutCommentsNestedInputSchema';
import { UserUpdateOneRequiredWithoutCommentsNestedInputSchema } from './UserUpdateOneRequiredWithoutCommentsNestedInputSchema';
import { CommentUpdateManyWithoutParentNestedInputSchema } from './CommentUpdateManyWithoutParentNestedInputSchema';
import { CommentHeartUpdateManyWithoutCommentNestedInputSchema } from './CommentHeartUpdateManyWithoutCommentNestedInputSchema';
import { CommentFileUpdateManyWithoutCommentNestedInputSchema } from './CommentFileUpdateManyWithoutCommentNestedInputSchema';
import { ReplyUpdateManyWithoutCommentNestedInputSchema } from './ReplyUpdateManyWithoutCommentNestedInputSchema';

export const CommentUpdateWithoutParentInputSchema: z.ZodType<Prisma.CommentUpdateWithoutParentInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  heartCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  post: z.lazy(() => PostUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  children: z.lazy(() => CommentUpdateManyWithoutParentNestedInputSchema).optional(),
  hearts: z.lazy(() => CommentHeartUpdateManyWithoutCommentNestedInputSchema).optional(),
  files: z.lazy(() => CommentFileUpdateManyWithoutCommentNestedInputSchema).optional(),
  replies: z.lazy(() => ReplyUpdateManyWithoutCommentNestedInputSchema).optional()
}).strict();

export default CommentUpdateWithoutParentInputSchema;
