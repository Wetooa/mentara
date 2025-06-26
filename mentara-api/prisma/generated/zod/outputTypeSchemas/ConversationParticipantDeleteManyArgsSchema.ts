import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantWhereInputSchema } from '../inputTypeSchemas/ConversationParticipantWhereInputSchema'

export const ConversationParticipantDeleteManyArgsSchema: z.ZodType<Prisma.ConversationParticipantDeleteManyArgs> = z.object({
  where: ConversationParticipantWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ConversationParticipantDeleteManyArgsSchema;
