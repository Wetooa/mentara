import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartCreateWithoutReplyInputSchema } from './ReplyHeartCreateWithoutReplyInputSchema';
import { ReplyHeartUncheckedCreateWithoutReplyInputSchema } from './ReplyHeartUncheckedCreateWithoutReplyInputSchema';
import { ReplyHeartCreateOrConnectWithoutReplyInputSchema } from './ReplyHeartCreateOrConnectWithoutReplyInputSchema';
import { ReplyHeartCreateManyReplyInputEnvelopeSchema } from './ReplyHeartCreateManyReplyInputEnvelopeSchema';
import { ReplyHeartWhereUniqueInputSchema } from './ReplyHeartWhereUniqueInputSchema';

export const ReplyHeartUncheckedCreateNestedManyWithoutReplyInputSchema: z.ZodType<Prisma.ReplyHeartUncheckedCreateNestedManyWithoutReplyInput> = z.object({
  create: z.union([ z.lazy(() => ReplyHeartCreateWithoutReplyInputSchema),z.lazy(() => ReplyHeartCreateWithoutReplyInputSchema).array(),z.lazy(() => ReplyHeartUncheckedCreateWithoutReplyInputSchema),z.lazy(() => ReplyHeartUncheckedCreateWithoutReplyInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReplyHeartCreateOrConnectWithoutReplyInputSchema),z.lazy(() => ReplyHeartCreateOrConnectWithoutReplyInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReplyHeartCreateManyReplyInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReplyHeartWhereUniqueInputSchema),z.lazy(() => ReplyHeartWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReplyHeartUncheckedCreateNestedManyWithoutReplyInputSchema;
