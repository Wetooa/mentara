import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartWhereUniqueInputSchema } from './ReplyHeartWhereUniqueInputSchema';
import { ReplyHeartCreateWithoutUserInputSchema } from './ReplyHeartCreateWithoutUserInputSchema';
import { ReplyHeartUncheckedCreateWithoutUserInputSchema } from './ReplyHeartUncheckedCreateWithoutUserInputSchema';

export const ReplyHeartCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ReplyHeartCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ReplyHeartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReplyHeartCreateWithoutUserInputSchema),z.lazy(() => ReplyHeartUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ReplyHeartCreateOrConnectWithoutUserInputSchema;
