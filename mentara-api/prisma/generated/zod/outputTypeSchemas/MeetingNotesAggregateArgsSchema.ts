import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingNotesWhereInputSchema } from '../inputTypeSchemas/MeetingNotesWhereInputSchema'
import { MeetingNotesOrderByWithRelationInputSchema } from '../inputTypeSchemas/MeetingNotesOrderByWithRelationInputSchema'
import { MeetingNotesWhereUniqueInputSchema } from '../inputTypeSchemas/MeetingNotesWhereUniqueInputSchema'

export const MeetingNotesAggregateArgsSchema: z.ZodType<Prisma.MeetingNotesAggregateArgs> = z.object({
  where: MeetingNotesWhereInputSchema.optional(),
  orderBy: z.union([ MeetingNotesOrderByWithRelationInputSchema.array(),MeetingNotesOrderByWithRelationInputSchema ]).optional(),
  cursor: MeetingNotesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MeetingNotesAggregateArgsSchema;
