import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentScalarWhereInputSchema } from './CommentScalarWhereInputSchema';
import { CommentUpdateManyMutationInputSchema } from './CommentUpdateManyMutationInputSchema';
import { CommentUncheckedUpdateManyWithoutUserInputSchema } from './CommentUncheckedUpdateManyWithoutUserInputSchema';

export const CommentUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.CommentUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => CommentScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CommentUpdateManyMutationInputSchema),z.lazy(() => CommentUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default CommentUpdateManyWithWhereWithoutUserInputSchema;
