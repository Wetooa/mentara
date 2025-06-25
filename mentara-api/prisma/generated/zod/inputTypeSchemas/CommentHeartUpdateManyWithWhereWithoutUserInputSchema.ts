import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartScalarWhereInputSchema } from './CommentHeartScalarWhereInputSchema';
import { CommentHeartUpdateManyMutationInputSchema } from './CommentHeartUpdateManyMutationInputSchema';
import { CommentHeartUncheckedUpdateManyWithoutUserInputSchema } from './CommentHeartUncheckedUpdateManyWithoutUserInputSchema';

export const CommentHeartUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.CommentHeartUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => CommentHeartScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CommentHeartUpdateManyMutationInputSchema),z.lazy(() => CommentHeartUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default CommentHeartUpdateManyWithWhereWithoutUserInputSchema;
