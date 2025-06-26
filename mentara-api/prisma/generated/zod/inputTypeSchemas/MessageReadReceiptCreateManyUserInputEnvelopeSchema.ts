import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptCreateManyUserInputSchema } from './MessageReadReceiptCreateManyUserInputSchema';

export const MessageReadReceiptCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.MessageReadReceiptCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MessageReadReceiptCreateManyUserInputSchema),z.lazy(() => MessageReadReceiptCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MessageReadReceiptCreateManyUserInputEnvelopeSchema;
