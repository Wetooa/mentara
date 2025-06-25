import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientWhereInputSchema } from '../inputTypeSchemas/ClientWhereInputSchema'

export const ClientDeleteManyArgsSchema: z.ZodType<Prisma.ClientDeleteManyArgs> = z.object({
  where: ClientWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ClientDeleteManyArgsSchema;
