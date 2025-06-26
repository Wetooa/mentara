import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingNotesIncludeSchema } from '../inputTypeSchemas/MeetingNotesIncludeSchema'
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

export const MeetingNotesFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.MeetingNotesFindUniqueOrThrowArgs> = z.object({
  select: MeetingNotesSelectSchema.optional(),
  include: z.lazy(() => MeetingNotesIncludeSchema).optional(),
  where: MeetingNotesWhereUniqueInputSchema,
}).strict() ;

export default MeetingNotesFindUniqueOrThrowArgsSchema;
