import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentFileWhereUniqueInputSchema } from './CommentFileWhereUniqueInputSchema';
import { CommentFileUpdateWithoutCommentInputSchema } from './CommentFileUpdateWithoutCommentInputSchema';
import { CommentFileUncheckedUpdateWithoutCommentInputSchema } from './CommentFileUncheckedUpdateWithoutCommentInputSchema';

export const CommentFileUpdateWithWhereUniqueWithoutCommentInputSchema: z.ZodType<Prisma.CommentFileUpdateWithWhereUniqueWithoutCommentInput> = z.object({
  where: z.lazy(() => CommentFileWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CommentFileUpdateWithoutCommentInputSchema),z.lazy(() => CommentFileUncheckedUpdateWithoutCommentInputSchema) ]),
}).strict();

export default CommentFileUpdateWithWhereUniqueWithoutCommentInputSchema;
