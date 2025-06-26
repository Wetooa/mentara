import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionCreateManyUserInputSchema } from './MessageReactionCreateManyUserInputSchema';

export const MessageReactionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.MessageReactionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MessageReactionCreateManyUserInputSchema),z.lazy(() => MessageReactionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MessageReactionCreateManyUserInputEnvelopeSchema;
