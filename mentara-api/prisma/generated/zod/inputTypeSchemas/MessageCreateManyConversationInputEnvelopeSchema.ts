import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateManyConversationInputSchema } from './MessageCreateManyConversationInputSchema';

export const MessageCreateManyConversationInputEnvelopeSchema: z.ZodType<Prisma.MessageCreateManyConversationInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MessageCreateManyConversationInputSchema),z.lazy(() => MessageCreateManyConversationInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MessageCreateManyConversationInputEnvelopeSchema;
