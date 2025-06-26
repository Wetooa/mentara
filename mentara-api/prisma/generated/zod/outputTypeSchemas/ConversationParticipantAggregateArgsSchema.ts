import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantWhereInputSchema } from '../inputTypeSchemas/ConversationParticipantWhereInputSchema'
import { ConversationParticipantOrderByWithRelationInputSchema } from '../inputTypeSchemas/ConversationParticipantOrderByWithRelationInputSchema'
import { ConversationParticipantWhereUniqueInputSchema } from '../inputTypeSchemas/ConversationParticipantWhereUniqueInputSchema'

export const ConversationParticipantAggregateArgsSchema: z.ZodType<Prisma.ConversationParticipantAggregateArgs> = z.object({
  where: ConversationParticipantWhereInputSchema.optional(),
  orderBy: z.union([ ConversationParticipantOrderByWithRelationInputSchema.array(),ConversationParticipantOrderByWithRelationInputSchema ]).optional(),
  cursor: ConversationParticipantWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ConversationParticipantAggregateArgsSchema;
