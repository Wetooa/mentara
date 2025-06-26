import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PreAssessmentCreateManyInputSchema } from '../inputTypeSchemas/PreAssessmentCreateManyInputSchema'

export const PreAssessmentCreateManyArgsSchema: z.ZodType<Prisma.PreAssessmentCreateManyArgs> = z.object({
  data: z.union([ PreAssessmentCreateManyInputSchema,PreAssessmentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default PreAssessmentCreateManyArgsSchema;
