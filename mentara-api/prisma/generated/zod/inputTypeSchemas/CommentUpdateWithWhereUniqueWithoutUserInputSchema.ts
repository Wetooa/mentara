import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateWithoutUserInputSchema } from './CommentUpdateWithoutUserInputSchema';
import { CommentUncheckedUpdateWithoutUserInputSchema } from './CommentUncheckedUpdateWithoutUserInputSchema';

export const CommentUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CommentUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CommentUpdateWithoutUserInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default CommentUpdateWithWhereUniqueWithoutUserInputSchema;
