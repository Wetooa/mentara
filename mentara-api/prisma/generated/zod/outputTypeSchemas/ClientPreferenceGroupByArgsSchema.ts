import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientPreferenceWhereInputSchema } from '../inputTypeSchemas/ClientPreferenceWhereInputSchema'
import { ClientPreferenceOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ClientPreferenceOrderByWithAggregationInputSchema'
import { ClientPreferenceScalarFieldEnumSchema } from '../inputTypeSchemas/ClientPreferenceScalarFieldEnumSchema'
import { ClientPreferenceScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ClientPreferenceScalarWhereWithAggregatesInputSchema'

export const ClientPreferenceGroupByArgsSchema: z.ZodType<Prisma.ClientPreferenceGroupByArgs> = z.object({
  where: ClientPreferenceWhereInputSchema.optional(),
  orderBy: z.union([ ClientPreferenceOrderByWithAggregationInputSchema.array(),ClientPreferenceOrderByWithAggregationInputSchema ]).optional(),
  by: ClientPreferenceScalarFieldEnumSchema.array(),
  having: ClientPreferenceScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ClientPreferenceGroupByArgsSchema;
