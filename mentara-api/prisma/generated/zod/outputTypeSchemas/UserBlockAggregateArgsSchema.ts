import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserBlockWhereInputSchema } from '../inputTypeSchemas/UserBlockWhereInputSchema'
import { UserBlockOrderByWithRelationInputSchema } from '../inputTypeSchemas/UserBlockOrderByWithRelationInputSchema'
import { UserBlockWhereUniqueInputSchema } from '../inputTypeSchemas/UserBlockWhereUniqueInputSchema'

export const UserBlockAggregateArgsSchema: z.ZodType<Prisma.UserBlockAggregateArgs> = z.object({
  where: UserBlockWhereInputSchema.optional(),
  orderBy: z.union([ UserBlockOrderByWithRelationInputSchema.array(),UserBlockOrderByWithRelationInputSchema ]).optional(),
  cursor: UserBlockWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default UserBlockAggregateArgsSchema;
