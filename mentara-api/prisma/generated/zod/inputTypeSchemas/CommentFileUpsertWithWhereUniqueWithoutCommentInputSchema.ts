import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentFileWhereUniqueInputSchema } from './CommentFileWhereUniqueInputSchema';
import { CommentFileUpdateWithoutCommentInputSchema } from './CommentFileUpdateWithoutCommentInputSchema';
import { CommentFileUncheckedUpdateWithoutCommentInputSchema } from './CommentFileUncheckedUpdateWithoutCommentInputSchema';
import { CommentFileCreateWithoutCommentInputSchema } from './CommentFileCreateWithoutCommentInputSchema';
import { CommentFileUncheckedCreateWithoutCommentInputSchema } from './CommentFileUncheckedCreateWithoutCommentInputSchema';

export const CommentFileUpsertWithWhereUniqueWithoutCommentInputSchema: z.ZodType<Prisma.CommentFileUpsertWithWhereUniqueWithoutCommentInput> = z.object({
  where: z.lazy(() => CommentFileWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CommentFileUpdateWithoutCommentInputSchema),z.lazy(() => CommentFileUncheckedUpdateWithoutCommentInputSchema) ]),
  create: z.union([ z.lazy(() => CommentFileCreateWithoutCommentInputSchema),z.lazy(() => CommentFileUncheckedCreateWithoutCommentInputSchema) ]),
}).strict();

export default CommentFileUpsertWithWhereUniqueWithoutCommentInputSchema;
