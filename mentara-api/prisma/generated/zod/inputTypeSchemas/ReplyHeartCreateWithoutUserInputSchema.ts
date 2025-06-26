import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateNestedOneWithoutHeartsInputSchema } from './ReplyCreateNestedOneWithoutHeartsInputSchema';

export const ReplyHeartCreateWithoutUserInputSchema: z.ZodType<Prisma.ReplyHeartCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  reply: z.lazy(() => ReplyCreateNestedOneWithoutHeartsInputSchema)
}).strict();

export default ReplyHeartCreateWithoutUserInputSchema;
