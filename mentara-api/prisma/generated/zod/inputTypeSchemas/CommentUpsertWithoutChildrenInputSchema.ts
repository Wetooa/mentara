import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentUpdateWithoutChildrenInputSchema } from './CommentUpdateWithoutChildrenInputSchema';
import { CommentUncheckedUpdateWithoutChildrenInputSchema } from './CommentUncheckedUpdateWithoutChildrenInputSchema';
import { CommentCreateWithoutChildrenInputSchema } from './CommentCreateWithoutChildrenInputSchema';
import { CommentUncheckedCreateWithoutChildrenInputSchema } from './CommentUncheckedCreateWithoutChildrenInputSchema';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';

export const CommentUpsertWithoutChildrenInputSchema: z.ZodType<Prisma.CommentUpsertWithoutChildrenInput> = z.object({
  update: z.union([ z.lazy(() => CommentUpdateWithoutChildrenInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutChildrenInputSchema) ]),
  create: z.union([ z.lazy(() => CommentCreateWithoutChildrenInputSchema),z.lazy(() => CommentUncheckedCreateWithoutChildrenInputSchema) ]),
  where: z.lazy(() => CommentWhereInputSchema).optional()
}).strict();

export default CommentUpsertWithoutChildrenInputSchema;
