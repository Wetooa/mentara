import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyFileWhereUniqueInputSchema } from './ReplyFileWhereUniqueInputSchema';
import { ReplyFileCreateWithoutReplyInputSchema } from './ReplyFileCreateWithoutReplyInputSchema';
import { ReplyFileUncheckedCreateWithoutReplyInputSchema } from './ReplyFileUncheckedCreateWithoutReplyInputSchema';

export const ReplyFileCreateOrConnectWithoutReplyInputSchema: z.ZodType<Prisma.ReplyFileCreateOrConnectWithoutReplyInput> = z.object({
  where: z.lazy(() => ReplyFileWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReplyFileCreateWithoutReplyInputSchema),z.lazy(() => ReplyFileUncheckedCreateWithoutReplyInputSchema) ]),
}).strict();

export default ReplyFileCreateOrConnectWithoutReplyInputSchema;
