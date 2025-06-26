import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserBlockWhereInputSchema } from '../inputTypeSchemas/UserBlockWhereInputSchema'
import { UserBlockOrderByWithAggregationInputSchema } from '../inputTypeSchemas/UserBlockOrderByWithAggregationInputSchema'
import { UserBlockScalarFieldEnumSchema } from '../inputTypeSchemas/UserBlockScalarFieldEnumSchema'
import { UserBlockScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/UserBlockScalarWhereWithAggregatesInputSchema'

export const UserBlockGroupByArgsSchema: z.ZodType<Prisma.UserBlockGroupByArgs> = z.object({
  where: UserBlockWhereInputSchema.optional(),
  orderBy: z.union([ UserBlockOrderByWithAggregationInputSchema.array(),UserBlockOrderByWithAggregationInputSchema ]).optional(),
  by: UserBlockScalarFieldEnumSchema.array(),
  having: UserBlockScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default UserBlockGroupByArgsSchema;
