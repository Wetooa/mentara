import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartWhereUniqueInputSchema } from './ReplyHeartWhereUniqueInputSchema';
import { ReplyHeartUpdateWithoutUserInputSchema } from './ReplyHeartUpdateWithoutUserInputSchema';
import { ReplyHeartUncheckedUpdateWithoutUserInputSchema } from './ReplyHeartUncheckedUpdateWithoutUserInputSchema';
import { ReplyHeartCreateWithoutUserInputSchema } from './ReplyHeartCreateWithoutUserInputSchema';
import { ReplyHeartUncheckedCreateWithoutUserInputSchema } from './ReplyHeartUncheckedCreateWithoutUserInputSchema';

export const ReplyHeartUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReplyHeartUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ReplyHeartWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReplyHeartUpdateWithoutUserInputSchema),z.lazy(() => ReplyHeartUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ReplyHeartCreateWithoutUserInputSchema),z.lazy(() => ReplyHeartUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ReplyHeartUpsertWithWhereUniqueWithoutUserInputSchema;
