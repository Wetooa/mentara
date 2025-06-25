import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyScalarWhereInputSchema } from './ReplyScalarWhereInputSchema';
import { ReplyUpdateManyMutationInputSchema } from './ReplyUpdateManyMutationInputSchema';
import { ReplyUncheckedUpdateManyWithoutUserInputSchema } from './ReplyUncheckedUpdateManyWithoutUserInputSchema';

export const ReplyUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ReplyUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ReplyScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReplyUpdateManyMutationInputSchema),z.lazy(() => ReplyUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default ReplyUpdateManyWithWhereWithoutUserInputSchema;
