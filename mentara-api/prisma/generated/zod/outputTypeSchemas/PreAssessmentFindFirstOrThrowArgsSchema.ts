import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PreAssessmentIncludeSchema } from '../inputTypeSchemas/PreAssessmentIncludeSchema'
import { PreAssessmentWhereInputSchema } from '../inputTypeSchemas/PreAssessmentWhereInputSchema'
import { PreAssessmentOrderByWithRelationInputSchema } from '../inputTypeSchemas/PreAssessmentOrderByWithRelationInputSchema'
import { PreAssessmentWhereUniqueInputSchema } from '../inputTypeSchemas/PreAssessmentWhereUniqueInputSchema'
import { PreAssessmentScalarFieldEnumSchema } from '../inputTypeSchemas/PreAssessmentScalarFieldEnumSchema'
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

export const PreAssessmentFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PreAssessmentFindFirstOrThrowArgs> = z.object({
  select: PreAssessmentSelectSchema.optional(),
  include: z.lazy(() => PreAssessmentIncludeSchema).optional(),
  where: PreAssessmentWhereInputSchema.optional(),
  orderBy: z.union([ PreAssessmentOrderByWithRelationInputSchema.array(),PreAssessmentOrderByWithRelationInputSchema ]).optional(),
  cursor: PreAssessmentWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PreAssessmentScalarFieldEnumSchema,PreAssessmentScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default PreAssessmentFindFirstOrThrowArgsSchema;
