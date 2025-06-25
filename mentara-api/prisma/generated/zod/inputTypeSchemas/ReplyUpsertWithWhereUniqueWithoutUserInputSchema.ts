import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyUpdateWithoutUserInputSchema } from './ReplyUpdateWithoutUserInputSchema';
import { ReplyUncheckedUpdateWithoutUserInputSchema } from './ReplyUncheckedUpdateWithoutUserInputSchema';
import { ReplyCreateWithoutUserInputSchema } from './ReplyCreateWithoutUserInputSchema';
import { ReplyUncheckedCreateWithoutUserInputSchema } from './ReplyUncheckedCreateWithoutUserInputSchema';

export const ReplyUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReplyUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ReplyWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReplyUpdateWithoutUserInputSchema),z.lazy(() => ReplyUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ReplyCreateWithoutUserInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ReplyUpsertWithWhereUniqueWithoutUserInputSchema;
