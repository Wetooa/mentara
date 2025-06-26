import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantIncludeSchema } from '../inputTypeSchemas/ConversationParticipantIncludeSchema'
import { ConversationParticipantWhereUniqueInputSchema } from '../inputTypeSchemas/ConversationParticipantWhereUniqueInputSchema'
import { ConversationArgsSchema } from "../outputTypeSchemas/ConversationArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ConversationParticipantSelectSchema: z.ZodType<Prisma.ConversationParticipantSelect> = z.object({
  id: z.boolean().optional(),
  conversationId: z.boolean().optional(),
  userId: z.boolean().optional(),
  joinedAt: z.boolean().optional(),
  lastReadAt: z.boolean().optional(),
  role: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isMuted: z.boolean().optional(),
  conversation: z.union([z.boolean(),z.lazy(() => ConversationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const ConversationParticipantDeleteArgsSchema: z.ZodType<Prisma.ConversationParticipantDeleteArgs> = z.object({
  select: ConversationParticipantSelectSchema.optional(),
  include: z.lazy(() => ConversationParticipantIncludeSchema).optional(),
  where: ConversationParticipantWhereUniqueInputSchema,
}).strict() ;

export default ConversationParticipantDeleteArgsSchema;
