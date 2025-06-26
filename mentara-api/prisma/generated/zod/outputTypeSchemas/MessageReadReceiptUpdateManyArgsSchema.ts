import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReadReceiptUpdateManyMutationInputSchema } from '../inputTypeSchemas/MessageReadReceiptUpdateManyMutationInputSchema'
import { MessageReadReceiptUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/MessageReadReceiptUncheckedUpdateManyInputSchema'
import { MessageReadReceiptWhereInputSchema } from '../inputTypeSchemas/MessageReadReceiptWhereInputSchema'

export const MessageReadReceiptUpdateManyArgsSchema: z.ZodType<Prisma.MessageReadReceiptUpdateManyArgs> = z.object({
  data: z.union([ MessageReadReceiptUpdateManyMutationInputSchema,MessageReadReceiptUncheckedUpdateManyInputSchema ]),
  where: MessageReadReceiptWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MessageReadReceiptUpdateManyArgsSchema;
