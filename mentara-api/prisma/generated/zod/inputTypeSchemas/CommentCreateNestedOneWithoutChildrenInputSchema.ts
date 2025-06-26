import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutChildrenInputSchema } from './CommentCreateWithoutChildrenInputSchema';
import { CommentUncheckedCreateWithoutChildrenInputSchema } from './CommentUncheckedCreateWithoutChildrenInputSchema';
import { CommentCreateOrConnectWithoutChildrenInputSchema } from './CommentCreateOrConnectWithoutChildrenInputSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';

export const CommentCreateNestedOneWithoutChildrenInputSchema: z.ZodType<Prisma.CommentCreateNestedOneWithoutChildrenInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutChildrenInputSchema),z.lazy(() => CommentUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommentCreateOrConnectWithoutChildrenInputSchema).optional(),
  connect: z.lazy(() => CommentWhereUniqueInputSchema).optional()
}).strict();

export default CommentCreateNestedOneWithoutChildrenInputSchema;
