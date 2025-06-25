import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateWithoutPostInputSchema } from './CommentUpdateWithoutPostInputSchema';
import { CommentUncheckedUpdateWithoutPostInputSchema } from './CommentUncheckedUpdateWithoutPostInputSchema';
import { CommentCreateWithoutPostInputSchema } from './CommentCreateWithoutPostInputSchema';
import { CommentUncheckedCreateWithoutPostInputSchema } from './CommentUncheckedCreateWithoutPostInputSchema';

export const CommentUpsertWithWhereUniqueWithoutPostInputSchema: z.ZodType<Prisma.CommentUpsertWithWhereUniqueWithoutPostInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CommentUpdateWithoutPostInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutPostInputSchema) ]),
  create: z.union([ z.lazy(() => CommentCreateWithoutPostInputSchema),z.lazy(() => CommentUncheckedCreateWithoutPostInputSchema) ]),
}).strict();

export default CommentUpsertWithWhereUniqueWithoutPostInputSchema;
