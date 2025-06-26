import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';
import { CommentUpdateWithoutChildrenInputSchema } from './CommentUpdateWithoutChildrenInputSchema';
import { CommentUncheckedUpdateWithoutChildrenInputSchema } from './CommentUncheckedUpdateWithoutChildrenInputSchema';

export const CommentUpdateToOneWithWhereWithoutChildrenInputSchema: z.ZodType<Prisma.CommentUpdateToOneWithWhereWithoutChildrenInput> = z.object({
  where: z.lazy(() => CommentWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CommentUpdateWithoutChildrenInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutChildrenInputSchema) ]),
}).strict();

export default CommentUpdateToOneWithWhereWithoutChildrenInputSchema;
