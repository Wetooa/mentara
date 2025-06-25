import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientCreateManyInputSchema } from '../inputTypeSchemas/ClientCreateManyInputSchema'

export const ClientCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ClientCreateManyAndReturnArgs> = z.object({
  data: z.union([ ClientCreateManyInputSchema,ClientCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ClientCreateManyAndReturnArgsSchema;
