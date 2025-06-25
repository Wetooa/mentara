import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PreAssessmentWhereInputSchema } from './PreAssessmentWhereInputSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const PreAssessmentWhereUniqueInputSchema: z.ZodType<Prisma.PreAssessmentWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    clientId: z.string()
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    clientId: z.string(),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().optional(),
  AND: z.union([ z.lazy(() => PreAssessmentWhereInputSchema),z.lazy(() => PreAssessmentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PreAssessmentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PreAssessmentWhereInputSchema),z.lazy(() => PreAssessmentWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  questionnaires: z.lazy(() => JsonFilterSchema).optional(),
  answers: z.lazy(() => JsonFilterSchema).optional(),
  answerMatrix: z.lazy(() => JsonFilterSchema).optional(),
  scores: z.lazy(() => JsonFilterSchema).optional(),
  severityLevels: z.lazy(() => JsonFilterSchema).optional(),
  aiEstimate: z.lazy(() => JsonFilterSchema).optional(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
}).strict());

export default PreAssessmentWhereUniqueInputSchema;
