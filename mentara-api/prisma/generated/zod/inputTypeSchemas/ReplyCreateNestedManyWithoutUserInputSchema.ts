import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateWithoutUserInputSchema } from './ReplyCreateWithoutUserInputSchema';
import { ReplyUncheckedCreateWithoutUserInputSchema } from './ReplyUncheckedCreateWithoutUserInputSchema';
import { ReplyCreateOrConnectWithoutUserInputSchema } from './ReplyCreateOrConnectWithoutUserInputSchema';
import { ReplyCreateManyUserInputEnvelopeSchema } from './ReplyCreateManyUserInputEnvelopeSchema';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';

export const ReplyCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReplyCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ReplyCreateWithoutUserInputSchema),z.lazy(() => ReplyCreateWithoutUserInputSchema).array(),z.lazy(() => ReplyUncheckedCreateWithoutUserInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReplyCreateOrConnectWithoutUserInputSchema),z.lazy(() => ReplyCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReplyCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReplyWhereUniqueInputSchema),z.lazy(() => ReplyWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReplyCreateNestedManyWithoutUserInputSchema;
