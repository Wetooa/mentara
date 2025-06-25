import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorksheetOrderByWithRelationInputSchema } from './WorksheetOrderByWithRelationInputSchema';

export const WorksheetMaterialOrderByWithRelationInputSchema: z.ZodType<Prisma.WorksheetMaterialOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  worksheetId: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  worksheet: z.lazy(() => WorksheetOrderByWithRelationInputSchema).optional()
}).strict();

export default WorksheetMaterialOrderByWithRelationInputSchema;
