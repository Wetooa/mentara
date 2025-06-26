import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentUpdateWithoutRepliesInputSchema } from './CommentUpdateWithoutRepliesInputSchema';
import { CommentUncheckedUpdateWithoutRepliesInputSchema } from './CommentUncheckedUpdateWithoutRepliesInputSchema';
import { CommentCreateWithoutRepliesInputSchema } from './CommentCreateWithoutRepliesInputSchema';
import { CommentUncheckedCreateWithoutRepliesInputSchema } from './CommentUncheckedCreateWithoutRepliesInputSchema';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';

export const CommentUpsertWithoutRepliesInputSchema: z.ZodType<Prisma.CommentUpsertWithoutRepliesInput> = z.object({
  update: z.union([ z.lazy(() => CommentUpdateWithoutRepliesInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutRepliesInputSchema) ]),
  create: z.union([ z.lazy(() => CommentCreateWithoutRepliesInputSchema),z.lazy(() => CommentUncheckedCreateWithoutRepliesInputSchema) ]),
  where: z.lazy(() => CommentWhereInputSchema).optional()
}).strict();

export default CommentUpsertWithoutRepliesInputSchema;
