import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReadReceiptWhereInputSchema } from '../inputTypeSchemas/MessageReadReceiptWhereInputSchema'

export const MessageReadReceiptDeleteManyArgsSchema: z.ZodType<Prisma.MessageReadReceiptDeleteManyArgs> = z.object({
  where: MessageReadReceiptWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MessageReadReceiptDeleteManyArgsSchema;
