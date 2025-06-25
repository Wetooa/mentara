import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { PreAssessmentCountOrderByAggregateInputSchema } from './PreAssessmentCountOrderByAggregateInputSchema';
import { PreAssessmentMaxOrderByAggregateInputSchema } from './PreAssessmentMaxOrderByAggregateInputSchema';
import { PreAssessmentMinOrderByAggregateInputSchema } from './PreAssessmentMinOrderByAggregateInputSchema';

export const PreAssessmentOrderByWithAggregationInputSchema: z.ZodType<Prisma.PreAssessmentOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  questionnaires: z.lazy(() => SortOrderSchema).optional(),
  answers: z.lazy(() => SortOrderSchema).optional(),
  answerMatrix: z.lazy(() => SortOrderSchema).optional(),
  scores: z.lazy(() => SortOrderSchema).optional(),
  severityLevels: z.lazy(() => SortOrderSchema).optional(),
  aiEstimate: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => PreAssessmentCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PreAssessmentMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PreAssessmentMinOrderByAggregateInputSchema).optional()
}).strict();

export default PreAssessmentOrderByWithAggregationInputSchema;
