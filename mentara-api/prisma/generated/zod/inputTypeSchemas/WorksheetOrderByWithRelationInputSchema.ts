import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorksheetMaterialOrderByRelationAggregateInputSchema } from './WorksheetMaterialOrderByRelationAggregateInputSchema';
import { WorksheetSubmissionOrderByRelationAggregateInputSchema } from './WorksheetSubmissionOrderByRelationAggregateInputSchema';
import { ClientOrderByWithRelationInputSchema } from './ClientOrderByWithRelationInputSchema';
import { TherapistOrderByWithRelationInputSchema } from './TherapistOrderByWithRelationInputSchema';

export const WorksheetOrderByWithRelationInputSchema: z.ZodType<Prisma.WorksheetOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  therapistId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  materials: z.lazy(() => WorksheetMaterialOrderByRelationAggregateInputSchema).optional(),
  submissions: z.lazy(() => WorksheetSubmissionOrderByRelationAggregateInputSchema).optional(),
  client: z.lazy(() => ClientOrderByWithRelationInputSchema).optional(),
  therapist: z.lazy(() => TherapistOrderByWithRelationInputSchema).optional()
}).strict();

export default WorksheetOrderByWithRelationInputSchema;
