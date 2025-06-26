import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyFileUncheckedCreateNestedManyWithoutReplyInputSchema } from './ReplyFileUncheckedCreateNestedManyWithoutReplyInputSchema';

export const ReplyUncheckedCreateWithoutHeartsInputSchema: z.ZodType<Prisma.ReplyUncheckedCreateWithoutHeartsInput> = z.object({
  id: z.string().uuid().optional(),
  commentId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  files: z.lazy(() => ReplyFileUncheckedCreateNestedManyWithoutReplyInputSchema).optional()
}).strict();

export default ReplyUncheckedCreateWithoutHeartsInputSchema;
