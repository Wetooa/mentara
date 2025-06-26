import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingWhereInputSchema } from '../inputTypeSchemas/MeetingWhereInputSchema'
import { MeetingOrderByWithRelationInputSchema } from '../inputTypeSchemas/MeetingOrderByWithRelationInputSchema'
import { MeetingWhereUniqueInputSchema } from '../inputTypeSchemas/MeetingWhereUniqueInputSchema'

export const MeetingAggregateArgsSchema: z.ZodType<Prisma.MeetingAggregateArgs> = z.object({
  where: MeetingWhereInputSchema.optional(),
  orderBy: z.union([ MeetingOrderByWithRelationInputSchema.array(),MeetingOrderByWithRelationInputSchema ]).optional(),
  cursor: MeetingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MeetingAggregateArgsSchema;
