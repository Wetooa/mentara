import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReadReceiptCreateManyInputSchema } from '../inputTypeSchemas/MessageReadReceiptCreateManyInputSchema'

export const MessageReadReceiptCreateManyArgsSchema: z.ZodType<Prisma.MessageReadReceiptCreateManyArgs> = z.object({
  data: z.union([ MessageReadReceiptCreateManyInputSchema,MessageReadReceiptCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default MessageReadReceiptCreateManyArgsSchema;
