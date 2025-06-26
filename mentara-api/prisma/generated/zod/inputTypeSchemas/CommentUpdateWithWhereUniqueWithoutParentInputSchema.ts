import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateWithoutParentInputSchema } from './CommentUpdateWithoutParentInputSchema';
import { CommentUncheckedUpdateWithoutParentInputSchema } from './CommentUncheckedUpdateWithoutParentInputSchema';

export const CommentUpdateWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.CommentUpdateWithWhereUniqueWithoutParentInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CommentUpdateWithoutParentInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutParentInputSchema) ]),
}).strict();

export default CommentUpdateWithWhereUniqueWithoutParentInputSchema;
