import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentUpdateWithoutHeartsInputSchema } from './CommentUpdateWithoutHeartsInputSchema';
import { CommentUncheckedUpdateWithoutHeartsInputSchema } from './CommentUncheckedUpdateWithoutHeartsInputSchema';
import { CommentCreateWithoutHeartsInputSchema } from './CommentCreateWithoutHeartsInputSchema';
import { CommentUncheckedCreateWithoutHeartsInputSchema } from './CommentUncheckedCreateWithoutHeartsInputSchema';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';

export const CommentUpsertWithoutHeartsInputSchema: z.ZodType<Prisma.CommentUpsertWithoutHeartsInput> = z.object({
  update: z.union([ z.lazy(() => CommentUpdateWithoutHeartsInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutHeartsInputSchema) ]),
  create: z.union([ z.lazy(() => CommentCreateWithoutHeartsInputSchema),z.lazy(() => CommentUncheckedCreateWithoutHeartsInputSchema) ]),
  where: z.lazy(() => CommentWhereInputSchema).optional()
}).strict();

export default CommentUpsertWithoutHeartsInputSchema;
