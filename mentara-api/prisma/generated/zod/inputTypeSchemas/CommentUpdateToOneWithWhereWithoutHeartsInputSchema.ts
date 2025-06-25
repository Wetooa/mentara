import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';
import { CommentUpdateWithoutHeartsInputSchema } from './CommentUpdateWithoutHeartsInputSchema';
import { CommentUncheckedUpdateWithoutHeartsInputSchema } from './CommentUncheckedUpdateWithoutHeartsInputSchema';

export const CommentUpdateToOneWithWhereWithoutHeartsInputSchema: z.ZodType<Prisma.CommentUpdateToOneWithWhereWithoutHeartsInput> = z.object({
  where: z.lazy(() => CommentWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CommentUpdateWithoutHeartsInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutHeartsInputSchema) ]),
}).strict();

export default CommentUpdateToOneWithWhereWithoutHeartsInputSchema;
