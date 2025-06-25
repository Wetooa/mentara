import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyCreateWithoutUserInputSchema } from './ReplyCreateWithoutUserInputSchema';
import { ReplyUncheckedCreateWithoutUserInputSchema } from './ReplyUncheckedCreateWithoutUserInputSchema';

export const ReplyCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ReplyCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ReplyWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReplyCreateWithoutUserInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ReplyCreateOrConnectWithoutUserInputSchema;
