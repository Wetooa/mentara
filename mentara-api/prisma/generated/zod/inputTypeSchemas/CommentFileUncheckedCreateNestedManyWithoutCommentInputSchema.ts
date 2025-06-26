import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentFileCreateWithoutCommentInputSchema } from './CommentFileCreateWithoutCommentInputSchema';
import { CommentFileUncheckedCreateWithoutCommentInputSchema } from './CommentFileUncheckedCreateWithoutCommentInputSchema';
import { CommentFileCreateOrConnectWithoutCommentInputSchema } from './CommentFileCreateOrConnectWithoutCommentInputSchema';
import { CommentFileCreateManyCommentInputEnvelopeSchema } from './CommentFileCreateManyCommentInputEnvelopeSchema';
import { CommentFileWhereUniqueInputSchema } from './CommentFileWhereUniqueInputSchema';

export const CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema: z.ZodType<Prisma.CommentFileUncheckedCreateNestedManyWithoutCommentInput> = z.object({
  create: z.union([ z.lazy(() => CommentFileCreateWithoutCommentInputSchema),z.lazy(() => CommentFileCreateWithoutCommentInputSchema).array(),z.lazy(() => CommentFileUncheckedCreateWithoutCommentInputSchema),z.lazy(() => CommentFileUncheckedCreateWithoutCommentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentFileCreateOrConnectWithoutCommentInputSchema),z.lazy(() => CommentFileCreateOrConnectWithoutCommentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentFileCreateManyCommentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CommentFileWhereUniqueInputSchema),z.lazy(() => CommentFileWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema;
