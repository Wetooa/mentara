import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyCreateWithoutHeartsInputSchema } from './ReplyCreateWithoutHeartsInputSchema';
import { ReplyUncheckedCreateWithoutHeartsInputSchema } from './ReplyUncheckedCreateWithoutHeartsInputSchema';

export const ReplyCreateOrConnectWithoutHeartsInputSchema: z.ZodType<Prisma.ReplyCreateOrConnectWithoutHeartsInput> = z.object({
  where: z.lazy(() => ReplyWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReplyCreateWithoutHeartsInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutHeartsInputSchema) ]),
}).strict();

export default ReplyCreateOrConnectWithoutHeartsInputSchema;
