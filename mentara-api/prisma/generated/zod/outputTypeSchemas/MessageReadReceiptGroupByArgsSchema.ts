import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReadReceiptWhereInputSchema } from '../inputTypeSchemas/MessageReadReceiptWhereInputSchema'
import { MessageReadReceiptOrderByWithAggregationInputSchema } from '../inputTypeSchemas/MessageReadReceiptOrderByWithAggregationInputSchema'
import { MessageReadReceiptScalarFieldEnumSchema } from '../inputTypeSchemas/MessageReadReceiptScalarFieldEnumSchema'
import { MessageReadReceiptScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/MessageReadReceiptScalarWhereWithAggregatesInputSchema'

export const MessageReadReceiptGroupByArgsSchema: z.ZodType<Prisma.MessageReadReceiptGroupByArgs> = z.object({
  where: MessageReadReceiptWhereInputSchema.optional(),
  orderBy: z.union([ MessageReadReceiptOrderByWithAggregationInputSchema.array(),MessageReadReceiptOrderByWithAggregationInputSchema ]).optional(),
  by: MessageReadReceiptScalarFieldEnumSchema.array(),
  having: MessageReadReceiptScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MessageReadReceiptGroupByArgsSchema;
