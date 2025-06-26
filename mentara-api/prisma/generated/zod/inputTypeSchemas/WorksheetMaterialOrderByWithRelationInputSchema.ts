import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorksheetOrderByWithRelationInputSchema } from './WorksheetOrderByWithRelationInputSchema';

export const WorksheetMaterialOrderByWithRelationInputSchema: z.ZodType<Prisma.WorksheetMaterialOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  worksheetId: z.lazy(() => SortOrderSchema).optional(),
  filename: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  fileSize: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  fileType: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  worksheet: z.lazy(() => WorksheetOrderByWithRelationInputSchema).optional()
}).strict();

export default WorksheetMaterialOrderByWithRelationInputSchema;
