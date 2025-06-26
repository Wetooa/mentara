import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { PostUpdateOneRequiredWithoutCommentsNestedInputSchema } from './PostUpdateOneRequiredWithoutCommentsNestedInputSchema';
import { CommentHeartUpdateManyWithoutCommentNestedInputSchema } from './CommentHeartUpdateManyWithoutCommentNestedInputSchema';
import { CommentFileUpdateManyWithoutCommentNestedInputSchema } from './CommentFileUpdateManyWithoutCommentNestedInputSchema';
import { ReplyUpdateManyWithoutCommentNestedInputSchema } from './ReplyUpdateManyWithoutCommentNestedInputSchema';

export const CommentUpdateWithoutUserInputSchema: z.ZodType<Prisma.CommentUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  post: z.lazy(() => PostUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  hearts: z.lazy(() => CommentHeartUpdateManyWithoutCommentNestedInputSchema).optional(),
  files: z.lazy(() => CommentFileUpdateManyWithoutCommentNestedInputSchema).optional(),
  replies: z.lazy(() => ReplyUpdateManyWithoutCommentNestedInputSchema).optional()
}).strict();

export default CommentUpdateWithoutUserInputSchema;
