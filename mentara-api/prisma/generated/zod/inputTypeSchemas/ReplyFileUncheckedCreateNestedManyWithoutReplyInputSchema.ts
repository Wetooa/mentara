import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyFileCreateWithoutReplyInputSchema } from './ReplyFileCreateWithoutReplyInputSchema';
import { ReplyFileUncheckedCreateWithoutReplyInputSchema } from './ReplyFileUncheckedCreateWithoutReplyInputSchema';
import { ReplyFileCreateOrConnectWithoutReplyInputSchema } from './ReplyFileCreateOrConnectWithoutReplyInputSchema';
import { ReplyFileCreateManyReplyInputEnvelopeSchema } from './ReplyFileCreateManyReplyInputEnvelopeSchema';
import { ReplyFileWhereUniqueInputSchema } from './ReplyFileWhereUniqueInputSchema';

export const ReplyFileUncheckedCreateNestedManyWithoutReplyInputSchema: z.ZodType<Prisma.ReplyFileUncheckedCreateNestedManyWithoutReplyInput> = z.object({
  create: z.union([ z.lazy(() => ReplyFileCreateWithoutReplyInputSchema),z.lazy(() => ReplyFileCreateWithoutReplyInputSchema).array(),z.lazy(() => ReplyFileUncheckedCreateWithoutReplyInputSchema),z.lazy(() => ReplyFileUncheckedCreateWithoutReplyInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReplyFileCreateOrConnectWithoutReplyInputSchema),z.lazy(() => ReplyFileCreateOrConnectWithoutReplyInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReplyFileCreateManyReplyInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReplyFileWhereUniqueInputSchema),z.lazy(() => ReplyFileWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReplyFileUncheckedCreateNestedManyWithoutReplyInputSchema;
