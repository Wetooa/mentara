import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantCreateManyInputSchema } from '../inputTypeSchemas/ConversationParticipantCreateManyInputSchema'

export const ConversationParticipantCreateManyArgsSchema: z.ZodType<Prisma.ConversationParticipantCreateManyArgs> = z.object({
  data: z.union([ ConversationParticipantCreateManyInputSchema,ConversationParticipantCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ConversationParticipantCreateManyArgsSchema;
