import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientWhereInputSchema } from '../inputTypeSchemas/ClientWhereInputSchema'
import { ClientOrderByWithRelationInputSchema } from '../inputTypeSchemas/ClientOrderByWithRelationInputSchema'
import { ClientWhereUniqueInputSchema } from '../inputTypeSchemas/ClientWhereUniqueInputSchema'

export const ClientAggregateArgsSchema: z.ZodType<Prisma.ClientAggregateArgs> = z.object({
  where: ClientWhereInputSchema.optional(),
  orderBy: z.union([ ClientOrderByWithRelationInputSchema.array(),ClientOrderByWithRelationInputSchema ]).optional(),
  cursor: ClientWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ClientAggregateArgsSchema;
