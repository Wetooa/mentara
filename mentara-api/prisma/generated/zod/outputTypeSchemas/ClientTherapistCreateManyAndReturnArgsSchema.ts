import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientTherapistCreateManyInputSchema } from '../inputTypeSchemas/ClientTherapistCreateManyInputSchema'

export const ClientTherapistCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ClientTherapistCreateManyAndReturnArgs> = z.object({
  data: z.union([ ClientTherapistCreateManyInputSchema,ClientTherapistCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ClientTherapistCreateManyAndReturnArgsSchema;
