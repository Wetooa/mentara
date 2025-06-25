import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientWhereInputSchema } from '../inputTypeSchemas/ClientWhereInputSchema'
import { ClientOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ClientOrderByWithAggregationInputSchema'
import { ClientScalarFieldEnumSchema } from '../inputTypeSchemas/ClientScalarFieldEnumSchema'
import { ClientScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ClientScalarWhereWithAggregatesInputSchema'

export const ClientGroupByArgsSchema: z.ZodType<Prisma.ClientGroupByArgs> = z.object({
  where: ClientWhereInputSchema.optional(),
  orderBy: z.union([ ClientOrderByWithAggregationInputSchema.array(),ClientOrderByWithAggregationInputSchema ]).optional(),
  by: ClientScalarFieldEnumSchema.array(),
  having: ClientScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ClientGroupByArgsSchema;
