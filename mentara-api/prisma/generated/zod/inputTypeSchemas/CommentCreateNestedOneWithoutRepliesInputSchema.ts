import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutRepliesInputSchema } from './CommentCreateWithoutRepliesInputSchema';
import { CommentUncheckedCreateWithoutRepliesInputSchema } from './CommentUncheckedCreateWithoutRepliesInputSchema';
import { CommentCreateOrConnectWithoutRepliesInputSchema } from './CommentCreateOrConnectWithoutRepliesInputSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';

export const CommentCreateNestedOneWithoutRepliesInputSchema: z.ZodType<Prisma.CommentCreateNestedOneWithoutRepliesInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutRepliesInputSchema),z.lazy(() => CommentUncheckedCreateWithoutRepliesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommentCreateOrConnectWithoutRepliesInputSchema).optional(),
  connect: z.lazy(() => CommentWhereUniqueInputSchema).optional()
}).strict();

export default CommentCreateNestedOneWithoutRepliesInputSchema;
