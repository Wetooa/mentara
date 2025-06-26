import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageUpdateWithoutReplyToInputSchema } from './MessageUpdateWithoutReplyToInputSchema';
import { MessageUncheckedUpdateWithoutReplyToInputSchema } from './MessageUncheckedUpdateWithoutReplyToInputSchema';
import { MessageCreateWithoutReplyToInputSchema } from './MessageCreateWithoutReplyToInputSchema';
import { MessageUncheckedCreateWithoutReplyToInputSchema } from './MessageUncheckedCreateWithoutReplyToInputSchema';

export const MessageUpsertWithWhereUniqueWithoutReplyToInputSchema: z.ZodType<Prisma.MessageUpsertWithWhereUniqueWithoutReplyToInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MessageUpdateWithoutReplyToInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutReplyToInputSchema) ]),
  create: z.union([ z.lazy(() => MessageCreateWithoutReplyToInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReplyToInputSchema) ]),
}).strict();

export default MessageUpsertWithWhereUniqueWithoutReplyToInputSchema;
