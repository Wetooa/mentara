import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentCreateWithoutUserInputSchema } from './CommentCreateWithoutUserInputSchema';
import { CommentUncheckedCreateWithoutUserInputSchema } from './CommentUncheckedCreateWithoutUserInputSchema';

export const CommentCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.CommentCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentCreateWithoutUserInputSchema),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default CommentCreateOrConnectWithoutUserInputSchema;
