import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientTherapistCreateManyInputSchema } from '../inputTypeSchemas/ClientTherapistCreateManyInputSchema'

export const ClientTherapistCreateManyArgsSchema: z.ZodType<Prisma.ClientTherapistCreateManyArgs> = z.object({
  data: z.union([ ClientTherapistCreateManyInputSchema,ClientTherapistCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ClientTherapistCreateManyArgsSchema;
