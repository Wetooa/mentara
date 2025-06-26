import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateWithoutCommentInputSchema } from './ReplyCreateWithoutCommentInputSchema';
import { ReplyUncheckedCreateWithoutCommentInputSchema } from './ReplyUncheckedCreateWithoutCommentInputSchema';
import { ReplyCreateOrConnectWithoutCommentInputSchema } from './ReplyCreateOrConnectWithoutCommentInputSchema';
import { ReplyCreateManyCommentInputEnvelopeSchema } from './ReplyCreateManyCommentInputEnvelopeSchema';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';

export const ReplyUncheckedCreateNestedManyWithoutCommentInputSchema: z.ZodType<Prisma.ReplyUncheckedCreateNestedManyWithoutCommentInput> = z.object({
  create: z.union([ z.lazy(() => ReplyCreateWithoutCommentInputSchema),z.lazy(() => ReplyCreateWithoutCommentInputSchema).array(),z.lazy(() => ReplyUncheckedCreateWithoutCommentInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutCommentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReplyCreateOrConnectWithoutCommentInputSchema),z.lazy(() => ReplyCreateOrConnectWithoutCommentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReplyCreateManyCommentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReplyWhereUniqueInputSchema),z.lazy(() => ReplyWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReplyUncheckedCreateNestedManyWithoutCommentInputSchema;
