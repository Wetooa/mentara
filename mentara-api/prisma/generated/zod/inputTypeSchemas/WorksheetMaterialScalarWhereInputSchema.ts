import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const WorksheetMaterialScalarWhereInputSchema: z.ZodType<Prisma.WorksheetMaterialScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetMaterialScalarWhereInputSchema),z.lazy(() => WorksheetMaterialScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetMaterialScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetMaterialScalarWhereInputSchema),z.lazy(() => WorksheetMaterialScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default WorksheetMaterialScalarWhereInputSchema;
