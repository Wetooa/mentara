import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartWhereUniqueInputSchema } from './CommentHeartWhereUniqueInputSchema';
import { CommentHeartCreateWithoutCommentInputSchema } from './CommentHeartCreateWithoutCommentInputSchema';
import { CommentHeartUncheckedCreateWithoutCommentInputSchema } from './CommentHeartUncheckedCreateWithoutCommentInputSchema';

export const CommentHeartCreateOrConnectWithoutCommentInputSchema: z.ZodType<Prisma.CommentHeartCreateOrConnectWithoutCommentInput> = z.object({
  where: z.lazy(() => CommentHeartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentHeartCreateWithoutCommentInputSchema),z.lazy(() => CommentHeartUncheckedCreateWithoutCommentInputSchema) ]),
}).strict();

export default CommentHeartCreateOrConnectWithoutCommentInputSchema;
