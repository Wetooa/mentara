import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationUpdateManyMutationInputSchema } from '../inputTypeSchemas/ConversationUpdateManyMutationInputSchema'
import { ConversationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ConversationUncheckedUpdateManyInputSchema'
import { ConversationWhereInputSchema } from '../inputTypeSchemas/ConversationWhereInputSchema'

export const ConversationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ConversationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ConversationUpdateManyMutationInputSchema,ConversationUncheckedUpdateManyInputSchema ]),
  where: ConversationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ConversationUpdateManyAndReturnArgsSchema;
