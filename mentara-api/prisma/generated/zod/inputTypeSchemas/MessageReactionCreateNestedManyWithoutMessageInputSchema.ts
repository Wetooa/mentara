import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionCreateWithoutMessageInputSchema } from './MessageReactionCreateWithoutMessageInputSchema';
import { MessageReactionUncheckedCreateWithoutMessageInputSchema } from './MessageReactionUncheckedCreateWithoutMessageInputSchema';
import { MessageReactionCreateOrConnectWithoutMessageInputSchema } from './MessageReactionCreateOrConnectWithoutMessageInputSchema';
import { MessageReactionCreateManyMessageInputEnvelopeSchema } from './MessageReactionCreateManyMessageInputEnvelopeSchema';
import { MessageReactionWhereUniqueInputSchema } from './MessageReactionWhereUniqueInputSchema';

export const MessageReactionCreateNestedManyWithoutMessageInputSchema: z.ZodType<Prisma.MessageReactionCreateNestedManyWithoutMessageInput> = z.object({
  create: z.union([ z.lazy(() => MessageReactionCreateWithoutMessageInputSchema),z.lazy(() => MessageReactionCreateWithoutMessageInputSchema).array(),z.lazy(() => MessageReactionUncheckedCreateWithoutMessageInputSchema),z.lazy(() => MessageReactionUncheckedCreateWithoutMessageInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageReactionCreateOrConnectWithoutMessageInputSchema),z.lazy(() => MessageReactionCreateOrConnectWithoutMessageInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageReactionCreateManyMessageInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessageReactionWhereUniqueInputSchema),z.lazy(() => MessageReactionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MessageReactionCreateNestedManyWithoutMessageInputSchema;
