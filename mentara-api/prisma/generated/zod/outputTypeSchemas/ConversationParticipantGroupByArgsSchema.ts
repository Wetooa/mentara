import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantWhereInputSchema } from '../inputTypeSchemas/ConversationParticipantWhereInputSchema'
import { ConversationParticipantOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ConversationParticipantOrderByWithAggregationInputSchema'
import { ConversationParticipantScalarFieldEnumSchema } from '../inputTypeSchemas/ConversationParticipantScalarFieldEnumSchema'
import { ConversationParticipantScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ConversationParticipantScalarWhereWithAggregatesInputSchema'

export const ConversationParticipantGroupByArgsSchema: z.ZodType<Prisma.ConversationParticipantGroupByArgs> = z.object({
  where: ConversationParticipantWhereInputSchema.optional(),
  orderBy: z.union([ ConversationParticipantOrderByWithAggregationInputSchema.array(),ConversationParticipantOrderByWithAggregationInputSchema ]).optional(),
  by: ConversationParticipantScalarFieldEnumSchema.array(),
  having: ConversationParticipantScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ConversationParticipantGroupByArgsSchema;
