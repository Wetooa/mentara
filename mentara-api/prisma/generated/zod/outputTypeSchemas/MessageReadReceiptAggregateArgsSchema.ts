import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReadReceiptWhereInputSchema } from '../inputTypeSchemas/MessageReadReceiptWhereInputSchema'
import { MessageReadReceiptOrderByWithRelationInputSchema } from '../inputTypeSchemas/MessageReadReceiptOrderByWithRelationInputSchema'
import { MessageReadReceiptWhereUniqueInputSchema } from '../inputTypeSchemas/MessageReadReceiptWhereUniqueInputSchema'

export const MessageReadReceiptAggregateArgsSchema: z.ZodType<Prisma.MessageReadReceiptAggregateArgs> = z.object({
  where: MessageReadReceiptWhereInputSchema.optional(),
  orderBy: z.union([ MessageReadReceiptOrderByWithRelationInputSchema.array(),MessageReadReceiptOrderByWithRelationInputSchema ]).optional(),
  cursor: MessageReadReceiptWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MessageReadReceiptAggregateArgsSchema;
