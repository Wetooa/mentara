import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingNotesWhereInputSchema } from '../inputTypeSchemas/MeetingNotesWhereInputSchema'
import { MeetingNotesOrderByWithAggregationInputSchema } from '../inputTypeSchemas/MeetingNotesOrderByWithAggregationInputSchema'
import { MeetingNotesScalarFieldEnumSchema } from '../inputTypeSchemas/MeetingNotesScalarFieldEnumSchema'
import { MeetingNotesScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/MeetingNotesScalarWhereWithAggregatesInputSchema'

export const MeetingNotesGroupByArgsSchema: z.ZodType<Prisma.MeetingNotesGroupByArgs> = z.object({
  where: MeetingNotesWhereInputSchema.optional(),
  orderBy: z.union([ MeetingNotesOrderByWithAggregationInputSchema.array(),MeetingNotesOrderByWithAggregationInputSchema ]).optional(),
  by: MeetingNotesScalarFieldEnumSchema.array(),
  having: MeetingNotesScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MeetingNotesGroupByArgsSchema;
