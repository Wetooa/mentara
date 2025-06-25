import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartWhereUniqueInputSchema } from './ReplyHeartWhereUniqueInputSchema';
import { ReplyHeartUpdateWithoutReplyInputSchema } from './ReplyHeartUpdateWithoutReplyInputSchema';
import { ReplyHeartUncheckedUpdateWithoutReplyInputSchema } from './ReplyHeartUncheckedUpdateWithoutReplyInputSchema';

export const ReplyHeartUpdateWithWhereUniqueWithoutReplyInputSchema: z.ZodType<Prisma.ReplyHeartUpdateWithWhereUniqueWithoutReplyInput> = z.object({
  where: z.lazy(() => ReplyHeartWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReplyHeartUpdateWithoutReplyInputSchema),z.lazy(() => ReplyHeartUncheckedUpdateWithoutReplyInputSchema) ]),
}).strict();

export default ReplyHeartUpdateWithWhereUniqueWithoutReplyInputSchema;
