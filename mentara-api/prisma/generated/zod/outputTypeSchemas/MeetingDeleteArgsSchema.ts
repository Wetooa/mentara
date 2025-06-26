import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingIncludeSchema } from '../inputTypeSchemas/MeetingIncludeSchema'
import { MeetingWhereUniqueInputSchema } from '../inputTypeSchemas/MeetingWhereUniqueInputSchema'
import { MeetingNotesFindManyArgsSchema } from "../outputTypeSchemas/MeetingNotesFindManyArgsSchema"
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
import { ReviewFindManyArgsSchema } from "../outputTypeSchemas/ReviewFindManyArgsSchema"
import { MeetingCountOutputTypeArgsSchema } from "../outputTypeSchemas/MeetingCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MeetingSelectSchema: z.ZodType<Prisma.MeetingSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  startTime: z.boolean().optional(),
  duration: z.boolean().optional(),
  status: z.boolean().optional(),
  meetingType: z.boolean().optional(),
  meetingUrl: z.boolean().optional(),
  clientId: z.boolean().optional(),
  therapistId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  meetingNotes: z.union([z.boolean(),z.lazy(() => MeetingNotesFindManyArgsSchema)]).optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => MeetingCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const MeetingDeleteArgsSchema: z.ZodType<Prisma.MeetingDeleteArgs> = z.object({
  select: MeetingSelectSchema.optional(),
  include: z.lazy(() => MeetingIncludeSchema).optional(),
  where: MeetingWhereUniqueInputSchema,
}).strict() ;

export default MeetingDeleteArgsSchema;
