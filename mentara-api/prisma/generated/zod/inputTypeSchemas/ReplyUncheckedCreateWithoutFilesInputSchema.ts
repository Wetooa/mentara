import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartUncheckedCreateNestedManyWithoutReplyInputSchema } from './ReplyHeartUncheckedCreateNestedManyWithoutReplyInputSchema';

export const ReplyUncheckedCreateWithoutFilesInputSchema: z.ZodType<Prisma.ReplyUncheckedCreateWithoutFilesInput> = z.object({
  id: z.string().uuid().optional(),
  commentId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hearts: z.lazy(() => ReplyHeartUncheckedCreateNestedManyWithoutReplyInputSchema).optional()
}).strict();

export default ReplyUncheckedCreateWithoutFilesInputSchema;
