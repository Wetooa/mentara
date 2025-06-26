import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateNestedOneWithoutHeartsInputSchema } from './ReplyCreateNestedOneWithoutHeartsInputSchema';
import { UserCreateNestedOneWithoutReplyHeartsInputSchema } from './UserCreateNestedOneWithoutReplyHeartsInputSchema';

export const ReplyHeartCreateInputSchema: z.ZodType<Prisma.ReplyHeartCreateInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  reply: z.lazy(() => ReplyCreateNestedOneWithoutHeartsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutReplyHeartsInputSchema)
}).strict();

export default ReplyHeartCreateInputSchema;
