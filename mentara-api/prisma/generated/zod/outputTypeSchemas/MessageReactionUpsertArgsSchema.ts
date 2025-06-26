import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageReactionIncludeSchema } from '../inputTypeSchemas/MessageReactionIncludeSchema'
import { MessageReactionWhereUniqueInputSchema } from '../inputTypeSchemas/MessageReactionWhereUniqueInputSchema'
import { MessageReactionCreateInputSchema } from '../inputTypeSchemas/MessageReactionCreateInputSchema'
import { MessageReactionUncheckedCreateInputSchema } from '../inputTypeSchemas/MessageReactionUncheckedCreateInputSchema'
import { MessageReactionUpdateInputSchema } from '../inputTypeSchemas/MessageReactionUpdateInputSchema'
import { MessageReactionUncheckedUpdateInputSchema } from '../inputTypeSchemas/MessageReactionUncheckedUpdateInputSchema'
import { MessageArgsSchema } from "../outputTypeSchemas/MessageArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MessageReactionSelectSchema: z.ZodType<Prisma.MessageReactionSelect> = z.object({
  id: z.boolean().optional(),
  messageId: z.boolean().optional(),
  userId: z.boolean().optional(),
  emoji: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  message: z.union([z.boolean(),z.lazy(() => MessageArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const MessageReactionUpsertArgsSchema: z.ZodType<Prisma.MessageReactionUpsertArgs> = z.object({
  select: MessageReactionSelectSchema.optional(),
  include: z.lazy(() => MessageReactionIncludeSchema).optional(),
  where: MessageReactionWhereUniqueInputSchema,
  create: z.union([ MessageReactionCreateInputSchema,MessageReactionUncheckedCreateInputSchema ]),
  update: z.union([ MessageReactionUpdateInputSchema,MessageReactionUncheckedUpdateInputSchema ]),
}).strict() ;

export default MessageReactionUpsertArgsSchema;
