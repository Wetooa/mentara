import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientCreateManyInputSchema } from '../inputTypeSchemas/ClientCreateManyInputSchema'

export const ClientCreateManyArgsSchema: z.ZodType<Prisma.ClientCreateManyArgs> = z.object({
  data: z.union([ ClientCreateManyInputSchema,ClientCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ClientCreateManyArgsSchema;
