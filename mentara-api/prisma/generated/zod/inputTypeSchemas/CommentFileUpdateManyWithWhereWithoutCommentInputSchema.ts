import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentFileScalarWhereInputSchema } from './CommentFileScalarWhereInputSchema';
import { CommentFileUpdateManyMutationInputSchema } from './CommentFileUpdateManyMutationInputSchema';
import { CommentFileUncheckedUpdateManyWithoutCommentInputSchema } from './CommentFileUncheckedUpdateManyWithoutCommentInputSchema';

export const CommentFileUpdateManyWithWhereWithoutCommentInputSchema: z.ZodType<Prisma.CommentFileUpdateManyWithWhereWithoutCommentInput> = z.object({
  where: z.lazy(() => CommentFileScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CommentFileUpdateManyMutationInputSchema),z.lazy(() => CommentFileUncheckedUpdateManyWithoutCommentInputSchema) ]),
}).strict();

export default CommentFileUpdateManyWithWhereWithoutCommentInputSchema;
