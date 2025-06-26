import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageUpdateWithoutRepliesInputSchema } from './MessageUpdateWithoutRepliesInputSchema';
import { MessageUncheckedUpdateWithoutRepliesInputSchema } from './MessageUncheckedUpdateWithoutRepliesInputSchema';
import { MessageCreateWithoutRepliesInputSchema } from './MessageCreateWithoutRepliesInputSchema';
import { MessageUncheckedCreateWithoutRepliesInputSchema } from './MessageUncheckedCreateWithoutRepliesInputSchema';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';

export const MessageUpsertWithoutRepliesInputSchema: z.ZodType<Prisma.MessageUpsertWithoutRepliesInput> = z.object({
  update: z.union([ z.lazy(() => MessageUpdateWithoutRepliesInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutRepliesInputSchema) ]),
  create: z.union([ z.lazy(() => MessageCreateWithoutRepliesInputSchema),z.lazy(() => MessageUncheckedCreateWithoutRepliesInputSchema) ]),
  where: z.lazy(() => MessageWhereInputSchema).optional()
}).strict();

export default MessageUpsertWithoutRepliesInputSchema;
