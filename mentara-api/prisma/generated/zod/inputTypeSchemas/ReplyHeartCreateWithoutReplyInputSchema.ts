import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutReplyHeartsInputSchema } from './UserCreateNestedOneWithoutReplyHeartsInputSchema';

export const ReplyHeartCreateWithoutReplyInputSchema: z.ZodType<Prisma.ReplyHeartCreateWithoutReplyInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutReplyHeartsInputSchema)
}).strict();

export default ReplyHeartCreateWithoutReplyInputSchema;
