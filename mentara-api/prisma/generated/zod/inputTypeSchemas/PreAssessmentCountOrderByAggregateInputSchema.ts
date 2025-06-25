import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const PreAssessmentCountOrderByAggregateInputSchema: z.ZodType<Prisma.PreAssessmentCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  questionnaires: z.lazy(() => SortOrderSchema).optional(),
  answers: z.lazy(() => SortOrderSchema).optional(),
  answerMatrix: z.lazy(() => SortOrderSchema).optional(),
  scores: z.lazy(() => SortOrderSchema).optional(),
  severityLevels: z.lazy(() => SortOrderSchema).optional(),
  aiEstimate: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default PreAssessmentCountOrderByAggregateInputSchema;
