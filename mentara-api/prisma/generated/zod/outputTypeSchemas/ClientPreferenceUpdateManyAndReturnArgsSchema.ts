import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientPreferenceUpdateManyMutationInputSchema } from '../inputTypeSchemas/ClientPreferenceUpdateManyMutationInputSchema'
import { ClientPreferenceUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ClientPreferenceUncheckedUpdateManyInputSchema'
import { ClientPreferenceWhereInputSchema } from '../inputTypeSchemas/ClientPreferenceWhereInputSchema'

export const ClientPreferenceUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ClientPreferenceUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ClientPreferenceUpdateManyMutationInputSchema,ClientPreferenceUncheckedUpdateManyInputSchema ]),
  where: ClientPreferenceWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ClientPreferenceUpdateManyAndReturnArgsSchema;
