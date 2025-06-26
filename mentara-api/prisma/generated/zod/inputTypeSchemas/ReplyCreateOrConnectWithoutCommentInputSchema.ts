import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyCreateWithoutCommentInputSchema } from './ReplyCreateWithoutCommentInputSchema';
import { ReplyUncheckedCreateWithoutCommentInputSchema } from './ReplyUncheckedCreateWithoutCommentInputSchema';

export const ReplyCreateOrConnectWithoutCommentInputSchema: z.ZodType<Prisma.ReplyCreateOrConnectWithoutCommentInput> = z.object({
  where: z.lazy(() => ReplyWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReplyCreateWithoutCommentInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutCommentInputSchema) ]),
}).strict();

export default ReplyCreateOrConnectWithoutCommentInputSchema;
