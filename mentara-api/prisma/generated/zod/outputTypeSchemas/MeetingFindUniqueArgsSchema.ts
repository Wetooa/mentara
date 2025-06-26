import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingIncludeSchema } from '../inputTypeSchemas/MeetingIncludeSchema'
import { MeetingWhereUniqueInputSchema } from '../inputTypeSchemas/MeetingWhereUniqueInputSchema'
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
import { MeetingDurationArgsSchema } from "../outputTypeSchemas/MeetingDurationArgsSchema"
import { ReviewFindManyArgsSchema } from "../outputTypeSchemas/ReviewFindManyArgsSchema"
import { MeetingCountOutputTypeArgsSchema } from "../outputTypeSchemas/MeetingCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MeetingSelectSchema: z.ZodType<Prisma.MeetingSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  startTime: z.boolean().optional(),
  endTime: z.boolean().optional(),
  duration: z.boolean().optional(),
  status: z.boolean().optional(),
  meetingType: z.boolean().optional(),
  meetingUrl: z.boolean().optional(),
  notes: z.boolean().optional(),
  clientId: z.boolean().optional(),
  therapistId: z.boolean().optional(),
  durationId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
  durationConfig: z.union([z.boolean(),z.lazy(() => MeetingDurationArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => MeetingCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const MeetingFindUniqueArgsSchema: z.ZodType<Prisma.MeetingFindUniqueArgs> = z.object({
  select: MeetingSelectSchema.optional(),
  include: z.lazy(() => MeetingIncludeSchema).optional(),
  where: MeetingWhereUniqueInputSchema,
}).strict() ;

export default MeetingFindUniqueArgsSchema;
