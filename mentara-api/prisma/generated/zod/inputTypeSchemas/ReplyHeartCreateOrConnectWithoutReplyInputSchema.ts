import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartWhereUniqueInputSchema } from './ReplyHeartWhereUniqueInputSchema';
import { ReplyHeartCreateWithoutReplyInputSchema } from './ReplyHeartCreateWithoutReplyInputSchema';
import { ReplyHeartUncheckedCreateWithoutReplyInputSchema } from './ReplyHeartUncheckedCreateWithoutReplyInputSchema';

export const ReplyHeartCreateOrConnectWithoutReplyInputSchema: z.ZodType<Prisma.ReplyHeartCreateOrConnectWithoutReplyInput> = z.object({
  where: z.lazy(() => ReplyHeartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReplyHeartCreateWithoutReplyInputSchema),z.lazy(() => ReplyHeartUncheckedCreateWithoutReplyInputSchema) ]),
}).strict();

export default ReplyHeartCreateOrConnectWithoutReplyInputSchema;
