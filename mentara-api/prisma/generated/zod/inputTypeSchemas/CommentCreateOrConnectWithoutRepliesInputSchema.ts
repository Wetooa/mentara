import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentCreateWithoutRepliesInputSchema } from './CommentCreateWithoutRepliesInputSchema';
import { CommentUncheckedCreateWithoutRepliesInputSchema } from './CommentUncheckedCreateWithoutRepliesInputSchema';

export const CommentCreateOrConnectWithoutRepliesInputSchema: z.ZodType<Prisma.CommentCreateOrConnectWithoutRepliesInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentCreateWithoutRepliesInputSchema),z.lazy(() => CommentUncheckedCreateWithoutRepliesInputSchema) ]),
}).strict();

export default CommentCreateOrConnectWithoutRepliesInputSchema;
