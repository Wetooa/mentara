import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientPreferenceWhereInputSchema } from '../inputTypeSchemas/ClientPreferenceWhereInputSchema'
import { ClientPreferenceOrderByWithRelationInputSchema } from '../inputTypeSchemas/ClientPreferenceOrderByWithRelationInputSchema'
import { ClientPreferenceWhereUniqueInputSchema } from '../inputTypeSchemas/ClientPreferenceWhereUniqueInputSchema'

export const ClientPreferenceAggregateArgsSchema: z.ZodType<Prisma.ClientPreferenceAggregateArgs> = z.object({
  where: ClientPreferenceWhereInputSchema.optional(),
  orderBy: z.union([ ClientPreferenceOrderByWithRelationInputSchema.array(),ClientPreferenceOrderByWithRelationInputSchema ]).optional(),
  cursor: ClientPreferenceWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ClientPreferenceAggregateArgsSchema;
