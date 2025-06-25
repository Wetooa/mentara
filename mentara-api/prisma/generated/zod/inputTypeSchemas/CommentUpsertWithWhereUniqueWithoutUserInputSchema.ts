import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateWithoutUserInputSchema } from './CommentUpdateWithoutUserInputSchema';
import { CommentUncheckedUpdateWithoutUserInputSchema } from './CommentUncheckedUpdateWithoutUserInputSchema';
import { CommentCreateWithoutUserInputSchema } from './CommentCreateWithoutUserInputSchema';
import { CommentUncheckedCreateWithoutUserInputSchema } from './CommentUncheckedCreateWithoutUserInputSchema';

export const CommentUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CommentUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CommentUpdateWithoutUserInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => CommentCreateWithoutUserInputSchema),z.lazy(() => CommentUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default CommentUpsertWithWhereUniqueWithoutUserInputSchema;
