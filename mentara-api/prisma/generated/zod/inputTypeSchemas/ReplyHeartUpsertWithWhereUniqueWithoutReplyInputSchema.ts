import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartWhereUniqueInputSchema } from './ReplyHeartWhereUniqueInputSchema';
import { ReplyHeartUpdateWithoutReplyInputSchema } from './ReplyHeartUpdateWithoutReplyInputSchema';
import { ReplyHeartUncheckedUpdateWithoutReplyInputSchema } from './ReplyHeartUncheckedUpdateWithoutReplyInputSchema';
import { ReplyHeartCreateWithoutReplyInputSchema } from './ReplyHeartCreateWithoutReplyInputSchema';
import { ReplyHeartUncheckedCreateWithoutReplyInputSchema } from './ReplyHeartUncheckedCreateWithoutReplyInputSchema';

export const ReplyHeartUpsertWithWhereUniqueWithoutReplyInputSchema: z.ZodType<Prisma.ReplyHeartUpsertWithWhereUniqueWithoutReplyInput> = z.object({
  where: z.lazy(() => ReplyHeartWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReplyHeartUpdateWithoutReplyInputSchema),z.lazy(() => ReplyHeartUncheckedUpdateWithoutReplyInputSchema) ]),
  create: z.union([ z.lazy(() => ReplyHeartCreateWithoutReplyInputSchema),z.lazy(() => ReplyHeartUncheckedCreateWithoutReplyInputSchema) ]),
}).strict();

export default ReplyHeartUpsertWithWhereUniqueWithoutReplyInputSchema;
