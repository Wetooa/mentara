import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereInputSchema } from './ReplyWhereInputSchema';
import { ReplyUpdateWithoutHeartsInputSchema } from './ReplyUpdateWithoutHeartsInputSchema';
import { ReplyUncheckedUpdateWithoutHeartsInputSchema } from './ReplyUncheckedUpdateWithoutHeartsInputSchema';

export const ReplyUpdateToOneWithWhereWithoutHeartsInputSchema: z.ZodType<Prisma.ReplyUpdateToOneWithWhereWithoutHeartsInput> = z.object({
  where: z.lazy(() => ReplyWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ReplyUpdateWithoutHeartsInputSchema),z.lazy(() => ReplyUncheckedUpdateWithoutHeartsInputSchema) ]),
}).strict();

export default ReplyUpdateToOneWithWhereWithoutHeartsInputSchema;
