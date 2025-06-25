import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationWhereInputSchema } from '../inputTypeSchemas/MeetingDurationWhereInputSchema'
import { MeetingDurationOrderByWithRelationInputSchema } from '../inputTypeSchemas/MeetingDurationOrderByWithRelationInputSchema'
import { MeetingDurationWhereUniqueInputSchema } from '../inputTypeSchemas/MeetingDurationWhereUniqueInputSchema'

export const MeetingDurationAggregateArgsSchema: z.ZodType<Prisma.MeetingDurationAggregateArgs> = z.object({
  where: MeetingDurationWhereInputSchema.optional(),
  orderBy: z.union([ MeetingDurationOrderByWithRelationInputSchema.array(),MeetingDurationOrderByWithRelationInputSchema ]).optional(),
  cursor: MeetingDurationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MeetingDurationAggregateArgsSchema;
