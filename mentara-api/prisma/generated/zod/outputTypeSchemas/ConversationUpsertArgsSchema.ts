import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationIncludeSchema } from '../inputTypeSchemas/ConversationIncludeSchema'
import { ConversationWhereUniqueInputSchema } from '../inputTypeSchemas/ConversationWhereUniqueInputSchema'
import { ConversationCreateInputSchema } from '../inputTypeSchemas/ConversationCreateInputSchema'
import { ConversationUncheckedCreateInputSchema } from '../inputTypeSchemas/ConversationUncheckedCreateInputSchema'
import { ConversationUpdateInputSchema } from '../inputTypeSchemas/ConversationUpdateInputSchema'
import { ConversationUncheckedUpdateInputSchema } from '../inputTypeSchemas/ConversationUncheckedUpdateInputSchema'
import { ConversationParticipantFindManyArgsSchema } from "../outputTypeSchemas/ConversationParticipantFindManyArgsSchema"
import { MessageFindManyArgsSchema } from "../outputTypeSchemas/MessageFindManyArgsSchema"
import { ConversationCountOutputTypeArgsSchema } from "../outputTypeSchemas/ConversationCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ConversationSelectSchema: z.ZodType<Prisma.ConversationSelect> = z.object({
  id: z.boolean().optional(),
  type: z.boolean().optional(),
  title: z.boolean().optional(),
  isActive: z.boolean().optional(),
  lastMessageAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  participants: z.union([z.boolean(),z.lazy(() => ConversationParticipantFindManyArgsSchema)]).optional(),
  messages: z.union([z.boolean(),z.lazy(() => MessageFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ConversationCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ConversationUpsertArgsSchema: z.ZodType<Prisma.ConversationUpsertArgs> = z.object({
  select: ConversationSelectSchema.optional(),
  include: z.lazy(() => ConversationIncludeSchema).optional(),
  where: ConversationWhereUniqueInputSchema,
  create: z.union([ ConversationCreateInputSchema,ConversationUncheckedCreateInputSchema ]),
  update: z.union([ ConversationUpdateInputSchema,ConversationUncheckedUpdateInputSchema ]),
}).strict() ;

export default ConversationUpsertArgsSchema;
