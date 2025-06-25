import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartScalarWhereInputSchema } from './ReplyHeartScalarWhereInputSchema';
import { ReplyHeartUpdateManyMutationInputSchema } from './ReplyHeartUpdateManyMutationInputSchema';
import { ReplyHeartUncheckedUpdateManyWithoutUserInputSchema } from './ReplyHeartUncheckedUpdateManyWithoutUserInputSchema';

export const ReplyHeartUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ReplyHeartUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ReplyHeartScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReplyHeartUpdateManyMutationInputSchema),z.lazy(() => ReplyHeartUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default ReplyHeartUpdateManyWithWhereWithoutUserInputSchema;
