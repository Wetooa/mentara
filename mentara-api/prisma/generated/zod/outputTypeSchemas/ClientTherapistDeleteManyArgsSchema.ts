import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientTherapistWhereInputSchema } from '../inputTypeSchemas/ClientTherapistWhereInputSchema'

export const ClientTherapistDeleteManyArgsSchema: z.ZodType<Prisma.ClientTherapistDeleteManyArgs> = z.object({
  where: ClientTherapistWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ClientTherapistDeleteManyArgsSchema;
