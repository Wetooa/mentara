import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentScalarWhereInputSchema } from './CommentScalarWhereInputSchema';
import { CommentUpdateManyMutationInputSchema } from './CommentUpdateManyMutationInputSchema';
import { CommentUncheckedUpdateManyWithoutParentInputSchema } from './CommentUncheckedUpdateManyWithoutParentInputSchema';

export const CommentUpdateManyWithWhereWithoutParentInputSchema: z.ZodType<Prisma.CommentUpdateManyWithWhereWithoutParentInput> = z.object({
  where: z.lazy(() => CommentScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CommentUpdateManyMutationInputSchema),z.lazy(() => CommentUncheckedUpdateManyWithoutParentInputSchema) ]),
}).strict();

export default CommentUpdateManyWithWhereWithoutParentInputSchema;
