import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantCreateManyInputSchema } from '../inputTypeSchemas/ConversationParticipantCreateManyInputSchema'

export const ConversationParticipantCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ConversationParticipantCreateManyAndReturnArgs> = z.object({
  data: z.union([ ConversationParticipantCreateManyInputSchema,ConversationParticipantCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ConversationParticipantCreateManyAndReturnArgsSchema;
