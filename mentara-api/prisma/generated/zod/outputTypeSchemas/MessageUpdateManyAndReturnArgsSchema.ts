import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MessageUpdateManyMutationInputSchema } from '../inputTypeSchemas/MessageUpdateManyMutationInputSchema'
import { MessageUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/MessageUncheckedUpdateManyInputSchema'
import { MessageWhereInputSchema } from '../inputTypeSchemas/MessageWhereInputSchema'

export const MessageUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.MessageUpdateManyAndReturnArgs> = z.object({
  data: z.union([ MessageUpdateManyMutationInputSchema,MessageUncheckedUpdateManyInputSchema ]),
  where: MessageWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MessageUpdateManyAndReturnArgsSchema;
