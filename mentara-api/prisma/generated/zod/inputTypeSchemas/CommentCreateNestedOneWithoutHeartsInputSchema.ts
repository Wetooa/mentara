import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutHeartsInputSchema } from './CommentCreateWithoutHeartsInputSchema';
import { CommentUncheckedCreateWithoutHeartsInputSchema } from './CommentUncheckedCreateWithoutHeartsInputSchema';
import { CommentCreateOrConnectWithoutHeartsInputSchema } from './CommentCreateOrConnectWithoutHeartsInputSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';

export const CommentCreateNestedOneWithoutHeartsInputSchema: z.ZodType<Prisma.CommentCreateNestedOneWithoutHeartsInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutHeartsInputSchema),z.lazy(() => CommentUncheckedCreateWithoutHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommentCreateOrConnectWithoutHeartsInputSchema).optional(),
  connect: z.lazy(() => CommentWhereUniqueInputSchema).optional()
}).strict();

export default CommentCreateNestedOneWithoutHeartsInputSchema;
