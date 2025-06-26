import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartScalarWhereInputSchema } from './ReplyHeartScalarWhereInputSchema';
import { ReplyHeartUpdateManyMutationInputSchema } from './ReplyHeartUpdateManyMutationInputSchema';
import { ReplyHeartUncheckedUpdateManyWithoutReplyInputSchema } from './ReplyHeartUncheckedUpdateManyWithoutReplyInputSchema';

export const ReplyHeartUpdateManyWithWhereWithoutReplyInputSchema: z.ZodType<Prisma.ReplyHeartUpdateManyWithWhereWithoutReplyInput> = z.object({
  where: z.lazy(() => ReplyHeartScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReplyHeartUpdateManyMutationInputSchema),z.lazy(() => ReplyHeartUncheckedUpdateManyWithoutReplyInputSchema) ]),
}).strict();

export default ReplyHeartUpdateManyWithWhereWithoutReplyInputSchema;
