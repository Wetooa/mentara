import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyUpdateWithoutCommentInputSchema } from './ReplyUpdateWithoutCommentInputSchema';
import { ReplyUncheckedUpdateWithoutCommentInputSchema } from './ReplyUncheckedUpdateWithoutCommentInputSchema';

export const ReplyUpdateWithWhereUniqueWithoutCommentInputSchema: z.ZodType<Prisma.ReplyUpdateWithWhereUniqueWithoutCommentInput> = z.object({
  where: z.lazy(() => ReplyWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReplyUpdateWithoutCommentInputSchema),z.lazy(() => ReplyUncheckedUpdateWithoutCommentInputSchema) ]),
}).strict();

export default ReplyUpdateWithWhereUniqueWithoutCommentInputSchema;
