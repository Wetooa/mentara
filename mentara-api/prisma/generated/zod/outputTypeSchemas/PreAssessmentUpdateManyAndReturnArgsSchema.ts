import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PreAssessmentUpdateManyMutationInputSchema } from '../inputTypeSchemas/PreAssessmentUpdateManyMutationInputSchema'
import { PreAssessmentUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/PreAssessmentUncheckedUpdateManyInputSchema'
import { PreAssessmentWhereInputSchema } from '../inputTypeSchemas/PreAssessmentWhereInputSchema'

export const PreAssessmentUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PreAssessmentUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PreAssessmentUpdateManyMutationInputSchema,PreAssessmentUncheckedUpdateManyInputSchema ]),
  where: PreAssessmentWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PreAssessmentUpdateManyAndReturnArgsSchema;
