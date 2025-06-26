import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientPreferenceWhereInputSchema } from '../inputTypeSchemas/ClientPreferenceWhereInputSchema'

export const ClientPreferenceDeleteManyArgsSchema: z.ZodType<Prisma.ClientPreferenceDeleteManyArgs> = z.object({
  where: ClientPreferenceWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ClientPreferenceDeleteManyArgsSchema;
