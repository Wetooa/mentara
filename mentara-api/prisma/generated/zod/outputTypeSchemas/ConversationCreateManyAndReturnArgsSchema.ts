import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationCreateManyInputSchema } from '../inputTypeSchemas/ConversationCreateManyInputSchema'

export const ConversationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ConversationCreateManyAndReturnArgs> = z.object({
  data: z.union([ ConversationCreateManyInputSchema,ConversationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ConversationCreateManyAndReturnArgsSchema;
