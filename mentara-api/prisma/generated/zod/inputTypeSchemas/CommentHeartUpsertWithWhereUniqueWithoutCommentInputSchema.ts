import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartWhereUniqueInputSchema } from './CommentHeartWhereUniqueInputSchema';
import { CommentHeartUpdateWithoutCommentInputSchema } from './CommentHeartUpdateWithoutCommentInputSchema';
import { CommentHeartUncheckedUpdateWithoutCommentInputSchema } from './CommentHeartUncheckedUpdateWithoutCommentInputSchema';
import { CommentHeartCreateWithoutCommentInputSchema } from './CommentHeartCreateWithoutCommentInputSchema';
import { CommentHeartUncheckedCreateWithoutCommentInputSchema } from './CommentHeartUncheckedCreateWithoutCommentInputSchema';

export const CommentHeartUpsertWithWhereUniqueWithoutCommentInputSchema: z.ZodType<Prisma.CommentHeartUpsertWithWhereUniqueWithoutCommentInput> = z.object({
  where: z.lazy(() => CommentHeartWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CommentHeartUpdateWithoutCommentInputSchema),z.lazy(() => CommentHeartUncheckedUpdateWithoutCommentInputSchema) ]),
  create: z.union([ z.lazy(() => CommentHeartCreateWithoutCommentInputSchema),z.lazy(() => CommentHeartUncheckedCreateWithoutCommentInputSchema) ]),
}).strict();

export default CommentHeartUpsertWithWhereUniqueWithoutCommentInputSchema;
