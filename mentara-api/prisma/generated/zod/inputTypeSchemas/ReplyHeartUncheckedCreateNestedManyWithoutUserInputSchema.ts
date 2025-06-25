import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartCreateWithoutUserInputSchema } from './ReplyHeartCreateWithoutUserInputSchema';
import { ReplyHeartUncheckedCreateWithoutUserInputSchema } from './ReplyHeartUncheckedCreateWithoutUserInputSchema';
import { ReplyHeartCreateOrConnectWithoutUserInputSchema } from './ReplyHeartCreateOrConnectWithoutUserInputSchema';
import { ReplyHeartCreateManyUserInputEnvelopeSchema } from './ReplyHeartCreateManyUserInputEnvelopeSchema';
import { ReplyHeartWhereUniqueInputSchema } from './ReplyHeartWhereUniqueInputSchema';

export const ReplyHeartUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReplyHeartUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ReplyHeartCreateWithoutUserInputSchema),z.lazy(() => ReplyHeartCreateWithoutUserInputSchema).array(),z.lazy(() => ReplyHeartUncheckedCreateWithoutUserInputSchema),z.lazy(() => ReplyHeartUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReplyHeartCreateOrConnectWithoutUserInputSchema),z.lazy(() => ReplyHeartCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReplyHeartCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReplyHeartWhereUniqueInputSchema),z.lazy(() => ReplyHeartWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReplyHeartUncheckedCreateNestedManyWithoutUserInputSchema;
