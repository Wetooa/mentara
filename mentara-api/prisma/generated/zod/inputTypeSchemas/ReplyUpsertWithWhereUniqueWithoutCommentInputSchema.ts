import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyUpdateWithoutCommentInputSchema } from './ReplyUpdateWithoutCommentInputSchema';
import { ReplyUncheckedUpdateWithoutCommentInputSchema } from './ReplyUncheckedUpdateWithoutCommentInputSchema';
import { ReplyCreateWithoutCommentInputSchema } from './ReplyCreateWithoutCommentInputSchema';
import { ReplyUncheckedCreateWithoutCommentInputSchema } from './ReplyUncheckedCreateWithoutCommentInputSchema';

export const ReplyUpsertWithWhereUniqueWithoutCommentInputSchema: z.ZodType<Prisma.ReplyUpsertWithWhereUniqueWithoutCommentInput> = z.object({
  where: z.lazy(() => ReplyWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReplyUpdateWithoutCommentInputSchema),z.lazy(() => ReplyUncheckedUpdateWithoutCommentInputSchema) ]),
  create: z.union([ z.lazy(() => ReplyCreateWithoutCommentInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutCommentInputSchema) ]),
}).strict();

export default ReplyUpsertWithWhereUniqueWithoutCommentInputSchema;
