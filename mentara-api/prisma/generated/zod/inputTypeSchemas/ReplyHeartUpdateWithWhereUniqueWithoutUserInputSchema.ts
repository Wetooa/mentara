import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartWhereUniqueInputSchema } from './ReplyHeartWhereUniqueInputSchema';
import { ReplyHeartUpdateWithoutUserInputSchema } from './ReplyHeartUpdateWithoutUserInputSchema';
import { ReplyHeartUncheckedUpdateWithoutUserInputSchema } from './ReplyHeartUncheckedUpdateWithoutUserInputSchema';

export const ReplyHeartUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReplyHeartUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ReplyHeartWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReplyHeartUpdateWithoutUserInputSchema),z.lazy(() => ReplyHeartUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default ReplyHeartUpdateWithWhereUniqueWithoutUserInputSchema;
