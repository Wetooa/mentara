import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentCreateWithoutHeartsInputSchema } from './CommentCreateWithoutHeartsInputSchema';
import { CommentUncheckedCreateWithoutHeartsInputSchema } from './CommentUncheckedCreateWithoutHeartsInputSchema';

export const CommentCreateOrConnectWithoutHeartsInputSchema: z.ZodType<Prisma.CommentCreateOrConnectWithoutHeartsInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentCreateWithoutHeartsInputSchema),z.lazy(() => CommentUncheckedCreateWithoutHeartsInputSchema) ]),
}).strict();

export default CommentCreateOrConnectWithoutHeartsInputSchema;
