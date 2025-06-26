import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionCreateManyMessageInputSchema } from './MessageReactionCreateManyMessageInputSchema';

export const MessageReactionCreateManyMessageInputEnvelopeSchema: z.ZodType<Prisma.MessageReactionCreateManyMessageInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MessageReactionCreateManyMessageInputSchema),z.lazy(() => MessageReactionCreateManyMessageInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MessageReactionCreateManyMessageInputEnvelopeSchema;
