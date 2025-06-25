import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentFileWhereUniqueInputSchema } from './CommentFileWhereUniqueInputSchema';
import { CommentFileCreateWithoutCommentInputSchema } from './CommentFileCreateWithoutCommentInputSchema';
import { CommentFileUncheckedCreateWithoutCommentInputSchema } from './CommentFileUncheckedCreateWithoutCommentInputSchema';

export const CommentFileCreateOrConnectWithoutCommentInputSchema: z.ZodType<Prisma.CommentFileCreateOrConnectWithoutCommentInput> = z.object({
  where: z.lazy(() => CommentFileWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentFileCreateWithoutCommentInputSchema),z.lazy(() => CommentFileUncheckedCreateWithoutCommentInputSchema) ]),
}).strict();

export default CommentFileCreateOrConnectWithoutCommentInputSchema;
