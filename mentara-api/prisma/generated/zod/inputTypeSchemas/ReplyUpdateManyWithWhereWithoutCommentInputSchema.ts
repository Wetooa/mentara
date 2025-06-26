import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyScalarWhereInputSchema } from './ReplyScalarWhereInputSchema';
import { ReplyUpdateManyMutationInputSchema } from './ReplyUpdateManyMutationInputSchema';
import { ReplyUncheckedUpdateManyWithoutCommentInputSchema } from './ReplyUncheckedUpdateManyWithoutCommentInputSchema';

export const ReplyUpdateManyWithWhereWithoutCommentInputSchema: z.ZodType<Prisma.ReplyUpdateManyWithWhereWithoutCommentInput> = z.object({
  where: z.lazy(() => ReplyScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReplyUpdateManyMutationInputSchema),z.lazy(() => ReplyUncheckedUpdateManyWithoutCommentInputSchema) ]),
}).strict();

export default ReplyUpdateManyWithWhereWithoutCommentInputSchema;
