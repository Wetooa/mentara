import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReadReceiptCreateManyInputSchema } from '../inputTypeSchemas/MessageReadReceiptCreateManyInputSchema'

export const MessageReadReceiptCreateManyAndReturnArgsSchema: z.ZodType<Prisma.MessageReadReceiptCreateManyAndReturnArgs> = z.object({
  data: z.union([ MessageReadReceiptCreateManyInputSchema,MessageReadReceiptCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default MessageReadReceiptCreateManyAndReturnArgsSchema;
