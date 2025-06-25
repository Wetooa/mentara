import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const WorksheetMaterialScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.WorksheetMaterialScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetMaterialScalarWhereWithAggregatesInputSchema),z.lazy(() => WorksheetMaterialScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetMaterialScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetMaterialScalarWhereWithAggregatesInputSchema),z.lazy(() => WorksheetMaterialScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default WorksheetMaterialScalarWhereWithAggregatesInputSchema;
