import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateWithoutHeartsInputSchema } from './ReplyCreateWithoutHeartsInputSchema';
import { ReplyUncheckedCreateWithoutHeartsInputSchema } from './ReplyUncheckedCreateWithoutHeartsInputSchema';
import { ReplyCreateOrConnectWithoutHeartsInputSchema } from './ReplyCreateOrConnectWithoutHeartsInputSchema';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';

export const ReplyCreateNestedOneWithoutHeartsInputSchema: z.ZodType<Prisma.ReplyCreateNestedOneWithoutHeartsInput> = z.object({
  create: z.union([ z.lazy(() => ReplyCreateWithoutHeartsInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReplyCreateOrConnectWithoutHeartsInputSchema).optional(),
  connect: z.lazy(() => ReplyWhereUniqueInputSchema).optional()
}).strict();

export default ReplyCreateNestedOneWithoutHeartsInputSchema;
