import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';
import { CommentUpdateWithoutRepliesInputSchema } from './CommentUpdateWithoutRepliesInputSchema';
import { CommentUncheckedUpdateWithoutRepliesInputSchema } from './CommentUncheckedUpdateWithoutRepliesInputSchema';

export const CommentUpdateToOneWithWhereWithoutRepliesInputSchema: z.ZodType<Prisma.CommentUpdateToOneWithWhereWithoutRepliesInput> = z.object({
  where: z.lazy(() => CommentWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CommentUpdateWithoutRepliesInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutRepliesInputSchema) ]),
}).strict();

export default CommentUpdateToOneWithWhereWithoutRepliesInputSchema;
