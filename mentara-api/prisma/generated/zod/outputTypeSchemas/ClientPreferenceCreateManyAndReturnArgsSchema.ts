import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientPreferenceCreateManyInputSchema } from '../inputTypeSchemas/ClientPreferenceCreateManyInputSchema'

export const ClientPreferenceCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ClientPreferenceCreateManyAndReturnArgs> = z.object({
  data: z.union([ ClientPreferenceCreateManyInputSchema,ClientPreferenceCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ClientPreferenceCreateManyAndReturnArgsSchema;
