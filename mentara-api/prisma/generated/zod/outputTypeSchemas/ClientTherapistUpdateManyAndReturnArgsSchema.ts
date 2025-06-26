import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientTherapistUpdateManyMutationInputSchema } from '../inputTypeSchemas/ClientTherapistUpdateManyMutationInputSchema'
import { ClientTherapistUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ClientTherapistUncheckedUpdateManyInputSchema'
import { ClientTherapistWhereInputSchema } from '../inputTypeSchemas/ClientTherapistWhereInputSchema'

export const ClientTherapistUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ClientTherapistUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ClientTherapistUpdateManyMutationInputSchema,ClientTherapistUncheckedUpdateManyInputSchema ]),
  where: ClientTherapistWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ClientTherapistUpdateManyAndReturnArgsSchema;
