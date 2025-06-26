import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartCreateWithoutCommentInputSchema } from './CommentHeartCreateWithoutCommentInputSchema';
import { CommentHeartUncheckedCreateWithoutCommentInputSchema } from './CommentHeartUncheckedCreateWithoutCommentInputSchema';
import { CommentHeartCreateOrConnectWithoutCommentInputSchema } from './CommentHeartCreateOrConnectWithoutCommentInputSchema';
import { CommentHeartCreateManyCommentInputEnvelopeSchema } from './CommentHeartCreateManyCommentInputEnvelopeSchema';
import { CommentHeartWhereUniqueInputSchema } from './CommentHeartWhereUniqueInputSchema';

export const CommentHeartCreateNestedManyWithoutCommentInputSchema: z.ZodType<Prisma.CommentHeartCreateNestedManyWithoutCommentInput> = z.object({
  create: z.union([ z.lazy(() => CommentHeartCreateWithoutCommentInputSchema),z.lazy(() => CommentHeartCreateWithoutCommentInputSchema).array(),z.lazy(() => CommentHeartUncheckedCreateWithoutCommentInputSchema),z.lazy(() => CommentHeartUncheckedCreateWithoutCommentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentHeartCreateOrConnectWithoutCommentInputSchema),z.lazy(() => CommentHeartCreateOrConnectWithoutCommentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentHeartCreateManyCommentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CommentHeartWhereUniqueInputSchema),z.lazy(() => CommentHeartWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CommentHeartCreateNestedManyWithoutCommentInputSchema;
