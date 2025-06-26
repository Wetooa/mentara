import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateWithoutParentInputSchema } from './CommentUpdateWithoutParentInputSchema';
import { CommentUncheckedUpdateWithoutParentInputSchema } from './CommentUncheckedUpdateWithoutParentInputSchema';
import { CommentCreateWithoutParentInputSchema } from './CommentCreateWithoutParentInputSchema';
import { CommentUncheckedCreateWithoutParentInputSchema } from './CommentUncheckedCreateWithoutParentInputSchema';

export const CommentUpsertWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.CommentUpsertWithWhereUniqueWithoutParentInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CommentUpdateWithoutParentInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutParentInputSchema) ]),
  create: z.union([ z.lazy(() => CommentCreateWithoutParentInputSchema),z.lazy(() => CommentUncheckedCreateWithoutParentInputSchema) ]),
}).strict();

export default CommentUpsertWithWhereUniqueWithoutParentInputSchema;
