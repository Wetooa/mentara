import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewIncludeSchema } from '../inputTypeSchemas/ReviewIncludeSchema'
import { ReviewWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewWhereUniqueInputSchema'
import { ReviewCreateInputSchema } from '../inputTypeSchemas/ReviewCreateInputSchema'
import { ReviewUncheckedCreateInputSchema } from '../inputTypeSchemas/ReviewUncheckedCreateInputSchema'
import { ReviewUpdateInputSchema } from '../inputTypeSchemas/ReviewUpdateInputSchema'
import { ReviewUncheckedUpdateInputSchema } from '../inputTypeSchemas/ReviewUncheckedUpdateInputSchema'
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
import { MeetingArgsSchema } from "../outputTypeSchemas/MeetingArgsSchema"
import { ReviewHelpfulFindManyArgsSchema } from "../outputTypeSchemas/ReviewHelpfulFindManyArgsSchema"
import { ReviewCountOutputTypeArgsSchema } from "../outputTypeSchemas/ReviewCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ReviewSelectSchema: z.ZodType<Prisma.ReviewSelect> = z.object({
  id: z.boolean().optional(),
  rating: z.boolean().optional(),
  title: z.boolean().optional(),
  content: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
  clientId: z.boolean().optional(),
  therapistId: z.boolean().optional(),
  meetingId: z.boolean().optional(),
  status: z.boolean().optional(),
  moderatedBy: z.boolean().optional(),
  moderatedAt: z.boolean().optional(),
  moderationNote: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  helpfulCount: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
  meeting: z.union([z.boolean(),z.lazy(() => MeetingArgsSchema)]).optional(),
  helpfulVotes: z.union([z.boolean(),z.lazy(() => ReviewHelpfulFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ReviewCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ReviewUpsertArgsSchema: z.ZodType<Prisma.ReviewUpsertArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: z.lazy(() => ReviewIncludeSchema).optional(),
  where: ReviewWhereUniqueInputSchema,
  create: z.union([ ReviewCreateInputSchema,ReviewUncheckedCreateInputSchema ]),
  update: z.union([ ReviewUpdateInputSchema,ReviewUncheckedUpdateInputSchema ]),
}).strict() ;

export default ReviewUpsertArgsSchema;
