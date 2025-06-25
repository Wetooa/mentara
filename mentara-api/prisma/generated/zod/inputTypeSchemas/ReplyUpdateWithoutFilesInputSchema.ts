import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { CommentUpdateOneRequiredWithoutRepliesNestedInputSchema } from './CommentUpdateOneRequiredWithoutRepliesNestedInputSchema';
import { UserUpdateOneRequiredWithoutRepliesNestedInputSchema } from './UserUpdateOneRequiredWithoutRepliesNestedInputSchema';
import { ReplyHeartUpdateManyWithoutReplyNestedInputSchema } from './ReplyHeartUpdateManyWithoutReplyNestedInputSchema';

export const ReplyUpdateWithoutFilesInputSchema: z.ZodType<Prisma.ReplyUpdateWithoutFilesInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  comment: z.lazy(() => CommentUpdateOneRequiredWithoutRepliesNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutRepliesNestedInputSchema).optional(),
  hearts: z.lazy(() => ReplyHeartUpdateManyWithoutReplyNestedInputSchema).optional()
}).strict();

export default ReplyUpdateWithoutFilesInputSchema;
