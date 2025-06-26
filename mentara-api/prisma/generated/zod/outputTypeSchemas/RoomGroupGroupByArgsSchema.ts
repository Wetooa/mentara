import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomGroupWhereInputSchema } from '../inputTypeSchemas/RoomGroupWhereInputSchema'
import { RoomGroupOrderByWithAggregationInputSchema } from '../inputTypeSchemas/RoomGroupOrderByWithAggregationInputSchema'
import { RoomGroupScalarFieldEnumSchema } from '../inputTypeSchemas/RoomGroupScalarFieldEnumSchema'
import { RoomGroupScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/RoomGroupScalarWhereWithAggregatesInputSchema'

export const RoomGroupGroupByArgsSchema: z.ZodType<Prisma.RoomGroupGroupByArgs> = z.object({
  where: RoomGroupWhereInputSchema.optional(),
  orderBy: z.union([ RoomGroupOrderByWithAggregationInputSchema.array(),RoomGroupOrderByWithAggregationInputSchema ]).optional(),
  by: RoomGroupScalarFieldEnumSchema.array(),
  having: RoomGroupScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default RoomGroupGroupByArgsSchema;
