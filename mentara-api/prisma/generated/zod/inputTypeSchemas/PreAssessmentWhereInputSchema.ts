import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const PreAssessmentWhereInputSchema: z.ZodType<Prisma.PreAssessmentWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PreAssessmentWhereInputSchema),z.lazy(() => PreAssessmentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PreAssessmentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PreAssessmentWhereInputSchema),z.lazy(() => PreAssessmentWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  questionnaires: z.lazy(() => JsonFilterSchema).optional(),
  answers: z.lazy(() => JsonFilterSchema).optional(),
  answerMatrix: z.lazy(() => JsonFilterSchema).optional(),
  scores: z.lazy(() => JsonFilterSchema).optional(),
  severityLevels: z.lazy(() => JsonFilterSchema).optional(),
  aiEstimate: z.lazy(() => JsonFilterSchema).optional(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
}).strict();

export default PreAssessmentWhereInputSchema;
