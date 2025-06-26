import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantUpdateManyMutationInputSchema } from '../inputTypeSchemas/ConversationParticipantUpdateManyMutationInputSchema'
import { ConversationParticipantUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ConversationParticipantUncheckedUpdateManyInputSchema'
import { ConversationParticipantWhereInputSchema } from '../inputTypeSchemas/ConversationParticipantWhereInputSchema'

export const ConversationParticipantUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ConversationParticipantUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ConversationParticipantUpdateManyMutationInputSchema,ConversationParticipantUncheckedUpdateManyInputSchema ]),
  where: ConversationParticipantWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ConversationParticipantUpdateManyAndReturnArgsSchema;
