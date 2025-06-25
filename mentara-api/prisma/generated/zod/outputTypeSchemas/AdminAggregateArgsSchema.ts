import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminWhereInputSchema } from '../inputTypeSchemas/AdminWhereInputSchema'
import { AdminOrderByWithRelationInputSchema } from '../inputTypeSchemas/AdminOrderByWithRelationInputSchema'
import { AdminWhereUniqueInputSchema } from '../inputTypeSchemas/AdminWhereUniqueInputSchema'

export const AdminAggregateArgsSchema: z.ZodType<Prisma.AdminAggregateArgs> = z.object({
  where: AdminWhereInputSchema.optional(),
  orderBy: z.union([ AdminOrderByWithRelationInputSchema.array(),AdminOrderByWithRelationInputSchema ]).optional(),
  cursor: AdminWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default AdminAggregateArgsSchema;
