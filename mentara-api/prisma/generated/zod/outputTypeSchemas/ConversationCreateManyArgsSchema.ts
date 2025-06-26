import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationCreateManyInputSchema } from '../inputTypeSchemas/ConversationCreateManyInputSchema'

export const ConversationCreateManyArgsSchema: z.ZodType<Prisma.ConversationCreateManyArgs> = z.object({
  data: z.union([ ConversationCreateManyInputSchema,ConversationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ConversationCreateManyArgsSchema;
