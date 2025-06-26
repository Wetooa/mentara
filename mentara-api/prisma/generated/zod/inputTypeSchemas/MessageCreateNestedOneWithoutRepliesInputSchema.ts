import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutRepliesInputSchema } from './MessageCreateWithoutRepliesInputSchema';
import { MessageUncheckedCreateWithoutRepliesInputSchema } from './MessageUncheckedCreateWithoutRepliesInputSchema';
import { MessageCreateOrConnectWithoutRepliesInputSchema } from './MessageCreateOrConnectWithoutRepliesInputSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';

export const MessageCreateNestedOneWithoutRepliesInputSchema: z.ZodType<Prisma.MessageCreateNestedOneWithoutRepliesInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutRepliesInputSchema),z.lazy(() => MessageUncheckedCreateWithoutRepliesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MessageCreateOrConnectWithoutRepliesInputSchema).optional(),
  connect: z.lazy(() => MessageWhereUniqueInputSchema).optional()
}).strict();

export default MessageCreateNestedOneWithoutRepliesInputSchema;
