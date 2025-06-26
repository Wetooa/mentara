import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyUpdateWithoutHeartsInputSchema } from './ReplyUpdateWithoutHeartsInputSchema';
import { ReplyUncheckedUpdateWithoutHeartsInputSchema } from './ReplyUncheckedUpdateWithoutHeartsInputSchema';
import { ReplyCreateWithoutHeartsInputSchema } from './ReplyCreateWithoutHeartsInputSchema';
import { ReplyUncheckedCreateWithoutHeartsInputSchema } from './ReplyUncheckedCreateWithoutHeartsInputSchema';
import { ReplyWhereInputSchema } from './ReplyWhereInputSchema';

export const ReplyUpsertWithoutHeartsInputSchema: z.ZodType<Prisma.ReplyUpsertWithoutHeartsInput> = z.object({
  update: z.union([ z.lazy(() => ReplyUpdateWithoutHeartsInputSchema),z.lazy(() => ReplyUncheckedUpdateWithoutHeartsInputSchema) ]),
  create: z.union([ z.lazy(() => ReplyCreateWithoutHeartsInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutHeartsInputSchema) ]),
  where: z.lazy(() => ReplyWhereInputSchema).optional()
}).strict();

export default ReplyUpsertWithoutHeartsInputSchema;
