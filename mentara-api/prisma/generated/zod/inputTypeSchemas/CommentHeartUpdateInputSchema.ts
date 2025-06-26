import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { CommentUpdateOneRequiredWithoutHeartsNestedInputSchema } from './CommentUpdateOneRequiredWithoutHeartsNestedInputSchema';
import { UserUpdateOneWithoutCommentHeartsNestedInputSchema } from './UserUpdateOneWithoutCommentHeartsNestedInputSchema';

export const CommentHeartUpdateInputSchema: z.ZodType<Prisma.CommentHeartUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  comment: z.lazy(() => CommentUpdateOneRequiredWithoutHeartsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneWithoutCommentHeartsNestedInputSchema).optional()
}).strict();

export default CommentHeartUpdateInputSchema;
