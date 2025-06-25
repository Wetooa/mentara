import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneWithoutCommentHeartsNestedInputSchema } from './UserUpdateOneWithoutCommentHeartsNestedInputSchema';

export const CommentHeartUpdateWithoutCommentInputSchema: z.ZodType<Prisma.CommentHeartUpdateWithoutCommentInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutCommentHeartsNestedInputSchema).optional()
}).strict();

export default CommentHeartUpdateWithoutCommentInputSchema;
