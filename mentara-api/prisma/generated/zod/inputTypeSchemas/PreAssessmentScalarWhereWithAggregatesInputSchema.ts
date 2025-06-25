import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';

export const PreAssessmentScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PreAssessmentScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => PreAssessmentScalarWhereWithAggregatesInputSchema),z.lazy(() => PreAssessmentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PreAssessmentScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PreAssessmentScalarWhereWithAggregatesInputSchema),z.lazy(() => PreAssessmentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  clientId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  questionnaires: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  answers: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  answerMatrix: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  scores: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  severityLevels: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  aiEstimate: z.lazy(() => JsonWithAggregatesFilterSchema).optional()
}).strict();

export default PreAssessmentScalarWhereWithAggregatesInputSchema;
