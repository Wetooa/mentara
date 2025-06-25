import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PreAssessmentWhereInputSchema } from './PreAssessmentWhereInputSchema';

export const PreAssessmentNullableScalarRelationFilterSchema: z.ZodType<Prisma.PreAssessmentNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => PreAssessmentWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => PreAssessmentWhereInputSchema).optional().nullable()
}).strict();

export default PreAssessmentNullableScalarRelationFilterSchema;
