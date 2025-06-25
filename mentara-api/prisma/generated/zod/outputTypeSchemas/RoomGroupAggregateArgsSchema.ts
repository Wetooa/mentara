import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomGroupWhereInputSchema } from '../inputTypeSchemas/RoomGroupWhereInputSchema'
import { RoomGroupOrderByWithRelationInputSchema } from '../inputTypeSchemas/RoomGroupOrderByWithRelationInputSchema'
import { RoomGroupWhereUniqueInputSchema } from '../inputTypeSchemas/RoomGroupWhereUniqueInputSchema'

export const RoomGroupAggregateArgsSchema: z.ZodType<Prisma.RoomGroupAggregateArgs> = z.object({
  where: RoomGroupWhereInputSchema.optional(),
  orderBy: z.union([ RoomGroupOrderByWithRelationInputSchema.array(),RoomGroupOrderByWithRelationInputSchema ]).optional(),
  cursor: RoomGroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default RoomGroupAggregateArgsSchema;
