import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingNotesFindManyArgsSchema } from "../outputTypeSchemas/MeetingNotesFindManyArgsSchema"
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
import { ReviewFindManyArgsSchema } from "../outputTypeSchemas/ReviewFindManyArgsSchema"
import { MeetingCountOutputTypeArgsSchema } from "../outputTypeSchemas/MeetingCountOutputTypeArgsSchema"

export const MeetingIncludeSchema: z.ZodType<Prisma.MeetingInclude> = z.object({
  meetingNotes: z.union([z.boolean(),z.lazy(() => MeetingNotesFindManyArgsSchema)]).optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => MeetingCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default MeetingIncludeSchema;
