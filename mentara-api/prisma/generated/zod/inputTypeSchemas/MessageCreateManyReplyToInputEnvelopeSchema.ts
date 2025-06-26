import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateManyReplyToInputSchema } from './MessageCreateManyReplyToInputSchema';

export const MessageCreateManyReplyToInputEnvelopeSchema: z.ZodType<Prisma.MessageCreateManyReplyToInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MessageCreateManyReplyToInputSchema),z.lazy(() => MessageCreateManyReplyToInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MessageCreateManyReplyToInputEnvelopeSchema;
