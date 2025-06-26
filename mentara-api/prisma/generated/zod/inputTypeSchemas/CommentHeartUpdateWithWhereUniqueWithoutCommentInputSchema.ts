import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartWhereUniqueInputSchema } from './CommentHeartWhereUniqueInputSchema';
import { CommentHeartUpdateWithoutCommentInputSchema } from './CommentHeartUpdateWithoutCommentInputSchema';
import { CommentHeartUncheckedUpdateWithoutCommentInputSchema } from './CommentHeartUncheckedUpdateWithoutCommentInputSchema';

export const CommentHeartUpdateWithWhereUniqueWithoutCommentInputSchema: z.ZodType<Prisma.CommentHeartUpdateWithWhereUniqueWithoutCommentInput> = z.object({
  where: z.lazy(() => CommentHeartWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CommentHeartUpdateWithoutCommentInputSchema),z.lazy(() => CommentHeartUncheckedUpdateWithoutCommentInputSchema) ]),
}).strict();

export default CommentHeartUpdateWithWhereUniqueWithoutCommentInputSchema;
