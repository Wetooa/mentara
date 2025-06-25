import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminWhereInputSchema } from '../inputTypeSchemas/AdminWhereInputSchema'
import { AdminOrderByWithAggregationInputSchema } from '../inputTypeSchemas/AdminOrderByWithAggregationInputSchema'
import { AdminScalarFieldEnumSchema } from '../inputTypeSchemas/AdminScalarFieldEnumSchema'
import { AdminScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/AdminScalarWhereWithAggregatesInputSchema'

export const AdminGroupByArgsSchema: z.ZodType<Prisma.AdminGroupByArgs> = z.object({
  where: AdminWhereInputSchema.optional(),
  orderBy: z.union([ AdminOrderByWithAggregationInputSchema.array(),AdminOrderByWithAggregationInputSchema ]).optional(),
  by: AdminScalarFieldEnumSchema.array(),
  having: AdminScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default AdminGroupByArgsSchema;
