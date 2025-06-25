import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartUncheckedCreateNestedManyWithoutReplyInputSchema } from './ReplyHeartUncheckedCreateNestedManyWithoutReplyInputSchema';
import { ReplyFileUncheckedCreateNestedManyWithoutReplyInputSchema } from './ReplyFileUncheckedCreateNestedManyWithoutReplyInputSchema';

export const ReplyUncheckedCreateWithoutCommentInputSchema: z.ZodType<Prisma.ReplyUncheckedCreateWithoutCommentInput> = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hearts: z.lazy(() => ReplyHeartUncheckedCreateNestedManyWithoutReplyInputSchema).optional(),
  files: z.lazy(() => ReplyFileUncheckedCreateNestedManyWithoutReplyInputSchema).optional()
}).strict();

export default ReplyUncheckedCreateWithoutCommentInputSchema;
