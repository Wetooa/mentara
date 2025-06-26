import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingNotesIncludeSchema } from '../inputTypeSchemas/MeetingNotesIncludeSchema'
import { MeetingNotesUpdateInputSchema } from '../inputTypeSchemas/MeetingNotesUpdateInputSchema'
import { MeetingNotesUncheckedUpdateInputSchema } from '../inputTypeSchemas/MeetingNotesUncheckedUpdateInputSchema'
import { MeetingNotesWhereUniqueInputSchema } from '../inputTypeSchemas/MeetingNotesWhereUniqueInputSchema'
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

export const MeetingNotesUpdateArgsSchema: z.ZodType<Prisma.MeetingNotesUpdateArgs> = z.object({
  select: MeetingNotesSelectSchema.optional(),
  include: z.lazy(() => MeetingNotesIncludeSchema).optional(),
  data: z.union([ MeetingNotesUpdateInputSchema,MeetingNotesUncheckedUpdateInputSchema ]),
  where: MeetingNotesWhereUniqueInputSchema,
}).strict() ;

export default MeetingNotesUpdateArgsSchema;
