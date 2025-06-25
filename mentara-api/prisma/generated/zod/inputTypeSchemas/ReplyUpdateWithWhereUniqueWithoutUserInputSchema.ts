import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyUpdateWithoutUserInputSchema } from './ReplyUpdateWithoutUserInputSchema';
import { ReplyUncheckedUpdateWithoutUserInputSchema } from './ReplyUncheckedUpdateWithoutUserInputSchema';

export const ReplyUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReplyUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ReplyWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReplyUpdateWithoutUserInputSchema),z.lazy(() => ReplyUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default ReplyUpdateWithWhereUniqueWithoutUserInputSchema;
