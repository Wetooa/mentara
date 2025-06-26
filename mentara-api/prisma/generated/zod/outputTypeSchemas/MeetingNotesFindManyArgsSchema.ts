import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingNotesIncludeSchema } from '../inputTypeSchemas/MeetingNotesIncludeSchema'
import { MeetingNotesWhereInputSchema } from '../inputTypeSchemas/MeetingNotesWhereInputSchema'
import { MeetingNotesOrderByWithRelationInputSchema } from '../inputTypeSchemas/MeetingNotesOrderByWithRelationInputSchema'
import { MeetingNotesWhereUniqueInputSchema } from '../inputTypeSchemas/MeetingNotesWhereUniqueInputSchema'
import { MeetingNotesScalarFieldEnumSchema } from '../inputTypeSchemas/MeetingNotesScalarFieldEnumSchema'
import { MeetingArgsSchema } from "../outputTypeSchemas/MeetingArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MeetingNotesSelectSchema: z.ZodType<Prisma.MeetingNotesSelect> = z.object({
  id: z.boolean().optional(),
  meetingId: z.boolean().optional(),
  notes: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  meeting: z.union([z.boolean(),z.lazy(() => MeetingArgsSchema)]).optional(),
}).strict()

export const MeetingNotesFindManyArgsSchema: z.ZodType<Prisma.MeetingNotesFindManyArgs> = z.object({
  select: MeetingNotesSelectSchema.optional(),
  include: z.lazy(() => MeetingNotesIncludeSchema).optional(),
  where: MeetingNotesWhereInputSchema.optional(),
  orderBy: z.union([ MeetingNotesOrderByWithRelationInputSchema.array(),MeetingNotesOrderByWithRelationInputSchema ]).optional(),
  cursor: MeetingNotesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MeetingNotesScalarFieldEnumSchema,MeetingNotesScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default MeetingNotesFindManyArgsSchema;
