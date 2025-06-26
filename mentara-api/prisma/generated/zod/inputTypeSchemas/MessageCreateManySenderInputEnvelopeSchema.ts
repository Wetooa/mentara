import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateManySenderInputSchema } from './MessageCreateManySenderInputSchema';

export const MessageCreateManySenderInputEnvelopeSchema: z.ZodType<Prisma.MessageCreateManySenderInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MessageCreateManySenderInputSchema),z.lazy(() => MessageCreateManySenderInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MessageCreateManySenderInputEnvelopeSchema;
