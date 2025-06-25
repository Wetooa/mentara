import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { ClientOrderByWithRelationInputSchema } from './ClientOrderByWithRelationInputSchema';

export const PreAssessmentOrderByWithRelationInputSchema: z.ZodType<Prisma.PreAssessmentOrderByWithRelationInput> = z.object({
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
  client: z.lazy(() => ClientOrderByWithRelationInputSchema).optional()
}).strict();

export default PreAssessmentOrderByWithRelationInputSchema;
