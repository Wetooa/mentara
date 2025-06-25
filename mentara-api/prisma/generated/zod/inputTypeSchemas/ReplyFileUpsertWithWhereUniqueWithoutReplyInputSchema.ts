import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyFileWhereUniqueInputSchema } from './ReplyFileWhereUniqueInputSchema';
import { ReplyFileUpdateWithoutReplyInputSchema } from './ReplyFileUpdateWithoutReplyInputSchema';
import { ReplyFileUncheckedUpdateWithoutReplyInputSchema } from './ReplyFileUncheckedUpdateWithoutReplyInputSchema';
import { ReplyFileCreateWithoutReplyInputSchema } from './ReplyFileCreateWithoutReplyInputSchema';
import { ReplyFileUncheckedCreateWithoutReplyInputSchema } from './ReplyFileUncheckedCreateWithoutReplyInputSchema';

export const ReplyFileUpsertWithWhereUniqueWithoutReplyInputSchema: z.ZodType<Prisma.ReplyFileUpsertWithWhereUniqueWithoutReplyInput> = z.object({
  where: z.lazy(() => ReplyFileWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReplyFileUpdateWithoutReplyInputSchema),z.lazy(() => ReplyFileUncheckedUpdateWithoutReplyInputSchema) ]),
  create: z.union([ z.lazy(() => ReplyFileCreateWithoutReplyInputSchema),z.lazy(() => ReplyFileUncheckedCreateWithoutReplyInputSchema) ]),
}).strict();

export default ReplyFileUpsertWithWhereUniqueWithoutReplyInputSchema;
