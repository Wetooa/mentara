import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationWhereInputSchema } from '../inputTypeSchemas/ConversationWhereInputSchema'

export const ConversationDeleteManyArgsSchema: z.ZodType<Prisma.ConversationDeleteManyArgs> = z.object({
  where: ConversationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ConversationDeleteManyArgsSchema;
