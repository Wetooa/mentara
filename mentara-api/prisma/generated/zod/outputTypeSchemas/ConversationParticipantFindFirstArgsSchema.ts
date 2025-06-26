import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantIncludeSchema } from '../inputTypeSchemas/ConversationParticipantIncludeSchema'
import { ConversationParticipantWhereInputSchema } from '../inputTypeSchemas/ConversationParticipantWhereInputSchema'
import { ConversationParticipantOrderByWithRelationInputSchema } from '../inputTypeSchemas/ConversationParticipantOrderByWithRelationInputSchema'
import { ConversationParticipantWhereUniqueInputSchema } from '../inputTypeSchemas/ConversationParticipantWhereUniqueInputSchema'
import { ConversationParticipantScalarFieldEnumSchema } from '../inputTypeSchemas/ConversationParticipantScalarFieldEnumSchema'
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

export const ConversationParticipantFindFirstArgsSchema: z.ZodType<Prisma.ConversationParticipantFindFirstArgs> = z.object({
  select: ConversationParticipantSelectSchema.optional(),
  include: z.lazy(() => ConversationParticipantIncludeSchema).optional(),
  where: ConversationParticipantWhereInputSchema.optional(),
  orderBy: z.union([ ConversationParticipantOrderByWithRelationInputSchema.array(),ConversationParticipantOrderByWithRelationInputSchema ]).optional(),
  cursor: ConversationParticipantWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ConversationParticipantScalarFieldEnumSchema,ConversationParticipantScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ConversationParticipantFindFirstArgsSchema;
