import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PreAssessmentIncludeSchema } from '../inputTypeSchemas/PreAssessmentIncludeSchema'
import { PreAssessmentWhereUniqueInputSchema } from '../inputTypeSchemas/PreAssessmentWhereUniqueInputSchema'
import { PreAssessmentCreateInputSchema } from '../inputTypeSchemas/PreAssessmentCreateInputSchema'
import { PreAssessmentUncheckedCreateInputSchema } from '../inputTypeSchemas/PreAssessmentUncheckedCreateInputSchema'
import { PreAssessmentUpdateInputSchema } from '../inputTypeSchemas/PreAssessmentUpdateInputSchema'
import { PreAssessmentUncheckedUpdateInputSchema } from '../inputTypeSchemas/PreAssessmentUncheckedUpdateInputSchema'
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const PreAssessmentSelectSchema: z.ZodType<Prisma.PreAssessmentSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  clientId: z.boolean().optional(),
  questionnaires: z.boolean().optional(),
  answers: z.boolean().optional(),
  answerMatrix: z.boolean().optional(),
  scores: z.boolean().optional(),
  severityLevels: z.boolean().optional(),
  aiEstimate: z.boolean().optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export const PreAssessmentUpsertArgsSchema: z.ZodType<Prisma.PreAssessmentUpsertArgs> = z.object({
  select: PreAssessmentSelectSchema.optional(),
  include: z.lazy(() => PreAssessmentIncludeSchema).optional(),
  where: PreAssessmentWhereUniqueInputSchema,
  create: z.union([ PreAssessmentCreateInputSchema,PreAssessmentUncheckedCreateInputSchema ]),
  update: z.union([ PreAssessmentUpdateInputSchema,PreAssessmentUncheckedUpdateInputSchema ]),
}).strict() ;

export default PreAssessmentUpsertArgsSchema;
