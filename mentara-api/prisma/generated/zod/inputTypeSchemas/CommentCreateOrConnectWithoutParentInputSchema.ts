import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentCreateWithoutParentInputSchema } from './CommentCreateWithoutParentInputSchema';
import { CommentUncheckedCreateWithoutParentInputSchema } from './CommentUncheckedCreateWithoutParentInputSchema';

export const CommentCreateOrConnectWithoutParentInputSchema: z.ZodType<Prisma.CommentCreateOrConnectWithoutParentInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentCreateWithoutParentInputSchema),z.lazy(() => CommentUncheckedCreateWithoutParentInputSchema) ]),
}).strict();

export default CommentCreateOrConnectWithoutParentInputSchema;
