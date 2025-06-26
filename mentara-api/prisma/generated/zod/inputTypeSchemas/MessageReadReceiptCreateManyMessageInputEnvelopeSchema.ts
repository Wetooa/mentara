import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptCreateManyMessageInputSchema } from './MessageReadReceiptCreateManyMessageInputSchema';

export const MessageReadReceiptCreateManyMessageInputEnvelopeSchema: z.ZodType<Prisma.MessageReadReceiptCreateManyMessageInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MessageReadReceiptCreateManyMessageInputSchema),z.lazy(() => MessageReadReceiptCreateManyMessageInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MessageReadReceiptCreateManyMessageInputEnvelopeSchema;
