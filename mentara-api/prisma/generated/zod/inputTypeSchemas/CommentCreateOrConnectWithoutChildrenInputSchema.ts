import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentCreateWithoutChildrenInputSchema } from './CommentCreateWithoutChildrenInputSchema';
import { CommentUncheckedCreateWithoutChildrenInputSchema } from './CommentUncheckedCreateWithoutChildrenInputSchema';

export const CommentCreateOrConnectWithoutChildrenInputSchema: z.ZodType<Prisma.CommentCreateOrConnectWithoutChildrenInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentCreateWithoutChildrenInputSchema),z.lazy(() => CommentUncheckedCreateWithoutChildrenInputSchema) ]),
}).strict();

export default CommentCreateOrConnectWithoutChildrenInputSchema;
