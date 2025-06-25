import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartScalarWhereInputSchema } from './CommentHeartScalarWhereInputSchema';
import { CommentHeartUpdateManyMutationInputSchema } from './CommentHeartUpdateManyMutationInputSchema';
import { CommentHeartUncheckedUpdateManyWithoutCommentInputSchema } from './CommentHeartUncheckedUpdateManyWithoutCommentInputSchema';

export const CommentHeartUpdateManyWithWhereWithoutCommentInputSchema: z.ZodType<Prisma.CommentHeartUpdateManyWithWhereWithoutCommentInput> = z.object({
  where: z.lazy(() => CommentHeartScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CommentHeartUpdateManyMutationInputSchema),z.lazy(() => CommentHeartUncheckedUpdateManyWithoutCommentInputSchema) ]),
}).strict();

export default CommentHeartUpdateManyWithWhereWithoutCommentInputSchema;
