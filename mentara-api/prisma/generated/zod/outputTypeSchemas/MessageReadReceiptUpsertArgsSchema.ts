import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReadReceiptIncludeSchema } from '../inputTypeSchemas/MessageReadReceiptIncludeSchema'
import { MessageReadReceiptWhereUniqueInputSchema } from '../inputTypeSchemas/MessageReadReceiptWhereUniqueInputSchema'
import { MessageReadReceiptCreateInputSchema } from '../inputTypeSchemas/MessageReadReceiptCreateInputSchema'
import { MessageReadReceiptUncheckedCreateInputSchema } from '../inputTypeSchemas/MessageReadReceiptUncheckedCreateInputSchema'
import { MessageReadReceiptUpdateInputSchema } from '../inputTypeSchemas/MessageReadReceiptUpdateInputSchema'
import { MessageReadReceiptUncheckedUpdateInputSchema } from '../inputTypeSchemas/MessageReadReceiptUncheckedUpdateInputSchema'
import { MessageArgsSchema } from "../outputTypeSchemas/MessageArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MessageReadReceiptSelectSchema: z.ZodType<Prisma.MessageReadReceiptSelect> = z.object({
  id: z.boolean().optional(),
  messageId: z.boolean().optional(),
  userId: z.boolean().optional(),
  readAt: z.boolean().optional(),
  message: z.union([z.boolean(),z.lazy(() => MessageArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const MessageReadReceiptUpsertArgsSchema: z.ZodType<Prisma.MessageReadReceiptUpsertArgs> = z.object({
  select: MessageReadReceiptSelectSchema.optional(),
  include: z.lazy(() => MessageReadReceiptIncludeSchema).optional(),
  where: MessageReadReceiptWhereUniqueInputSchema,
  create: z.union([ MessageReadReceiptCreateInputSchema,MessageReadReceiptUncheckedCreateInputSchema ]),
  update: z.union([ MessageReadReceiptUpdateInputSchema,MessageReadReceiptUncheckedUpdateInputSchema ]),
}).strict() ;

export default MessageReadReceiptUpsertArgsSchema;
