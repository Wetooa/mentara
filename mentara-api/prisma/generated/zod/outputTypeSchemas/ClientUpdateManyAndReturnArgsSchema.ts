import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientUpdateManyMutationInputSchema } from '../inputTypeSchemas/ClientUpdateManyMutationInputSchema'
import { ClientUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ClientUncheckedUpdateManyInputSchema'
import { ClientWhereInputSchema } from '../inputTypeSchemas/ClientWhereInputSchema'

export const ClientUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ClientUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ClientUpdateManyMutationInputSchema,ClientUncheckedUpdateManyInputSchema ]),
  where: ClientWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ClientUpdateManyAndReturnArgsSchema;
