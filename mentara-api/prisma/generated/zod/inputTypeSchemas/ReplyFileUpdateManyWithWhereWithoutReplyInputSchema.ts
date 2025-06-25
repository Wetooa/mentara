import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyFileScalarWhereInputSchema } from './ReplyFileScalarWhereInputSchema';
import { ReplyFileUpdateManyMutationInputSchema } from './ReplyFileUpdateManyMutationInputSchema';
import { ReplyFileUncheckedUpdateManyWithoutReplyInputSchema } from './ReplyFileUncheckedUpdateManyWithoutReplyInputSchema';

export const ReplyFileUpdateManyWithWhereWithoutReplyInputSchema: z.ZodType<Prisma.ReplyFileUpdateManyWithWhereWithoutReplyInput> = z.object({
  where: z.lazy(() => ReplyFileScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReplyFileUpdateManyMutationInputSchema),z.lazy(() => ReplyFileUncheckedUpdateManyWithoutReplyInputSchema) ]),
}).strict();

export default ReplyFileUpdateManyWithWhereWithoutReplyInputSchema;
