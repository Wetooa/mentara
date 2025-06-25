import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientTherapistWhereInputSchema } from '../inputTypeSchemas/ClientTherapistWhereInputSchema'
import { ClientTherapistOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ClientTherapistOrderByWithAggregationInputSchema'
import { ClientTherapistScalarFieldEnumSchema } from '../inputTypeSchemas/ClientTherapistScalarFieldEnumSchema'
import { ClientTherapistScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ClientTherapistScalarWhereWithAggregatesInputSchema'

export const ClientTherapistGroupByArgsSchema: z.ZodType<Prisma.ClientTherapistGroupByArgs> = z.object({
  where: ClientTherapistWhereInputSchema.optional(),
  orderBy: z.union([ ClientTherapistOrderByWithAggregationInputSchema.array(),ClientTherapistOrderByWithAggregationInputSchema ]).optional(),
  by: ClientTherapistScalarFieldEnumSchema.array(),
  having: ClientTherapistScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ClientTherapistGroupByArgsSchema;
