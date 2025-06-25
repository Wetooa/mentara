import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingIncludeSchema } from '../inputTypeSchemas/MeetingIncludeSchema'
import { MeetingWhereInputSchema } from '../inputTypeSchemas/MeetingWhereInputSchema'
import { MeetingOrderByWithRelationInputSchema } from '../inputTypeSchemas/MeetingOrderByWithRelationInputSchema'
import { MeetingWhereUniqueInputSchema } from '../inputTypeSchemas/MeetingWhereUniqueInputSchema'
import { MeetingScalarFieldEnumSchema } from '../inputTypeSchemas/MeetingScalarFieldEnumSchema'
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
import { MeetingDurationArgsSchema } from "../outputTypeSchemas/MeetingDurationArgsSchema"
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
}).strict()

export const MeetingFindFirstArgsSchema: z.ZodType<Prisma.MeetingFindFirstArgs> = z.object({
  select: MeetingSelectSchema.optional(),
  include: z.lazy(() => MeetingIncludeSchema).optional(),
  where: MeetingWhereInputSchema.optional(),
  orderBy: z.union([ MeetingOrderByWithRelationInputSchema.array(),MeetingOrderByWithRelationInputSchema ]).optional(),
  cursor: MeetingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MeetingScalarFieldEnumSchema,MeetingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default MeetingFindFirstArgsSchema;
