import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageCreateWithoutRepliesInputSchema } from './MessageCreateWithoutRepliesInputSchema';
import { MessageUncheckedCreateWithoutRepliesInputSchema } from './MessageUncheckedCreateWithoutRepliesInputSchema';

export const MessageCreateOrConnectWithoutRepliesInputSchema: z.ZodType<Prisma.MessageCreateOrConnectWithoutRepliesInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessageCreateWithoutRepliesInputSchema),z.lazy(() => MessageUncheckedCreateWithoutRepliesInputSchema) ]),
}).strict();

export default MessageCreateOrConnectWithoutRepliesInputSchema;
