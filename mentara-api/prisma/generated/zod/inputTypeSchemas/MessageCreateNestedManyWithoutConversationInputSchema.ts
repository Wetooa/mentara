import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutConversationInputSchema } from './MessageCreateWithoutConversationInputSchema';
import { MessageUncheckedCreateWithoutConversationInputSchema } from './MessageUncheckedCreateWithoutConversationInputSchema';
import { MessageCreateOrConnectWithoutConversationInputSchema } from './MessageCreateOrConnectWithoutConversationInputSchema';
import { MessageCreateManyConversationInputEnvelopeSchema } from './MessageCreateManyConversationInputEnvelopeSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';

export const MessageCreateNestedManyWithoutConversationInputSchema: z.ZodType<Prisma.MessageCreateNestedManyWithoutConversationInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutConversationInputSchema),z.lazy(() => MessageCreateWithoutConversationInputSchema).array(),z.lazy(() => MessageUncheckedCreateWithoutConversationInputSchema),z.lazy(() => MessageUncheckedCreateWithoutConversationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageCreateOrConnectWithoutConversationInputSchema),z.lazy(() => MessageCreateOrConnectWithoutConversationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageCreateManyConversationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MessageCreateNestedManyWithoutConversationInputSchema;
