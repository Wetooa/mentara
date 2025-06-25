import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialWhereInputSchema } from './WorksheetMaterialWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { WorksheetScalarRelationFilterSchema } from './WorksheetScalarRelationFilterSchema';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';

export const WorksheetMaterialWhereUniqueInputSchema: z.ZodType<Prisma.WorksheetMaterialWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => WorksheetMaterialWhereInputSchema),z.lazy(() => WorksheetMaterialWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetMaterialWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetMaterialWhereInputSchema),z.lazy(() => WorksheetMaterialWhereInputSchema).array() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  worksheet: z.union([ z.lazy(() => WorksheetScalarRelationFilterSchema),z.lazy(() => WorksheetWhereInputSchema) ]).optional(),
}).strict());

export default WorksheetMaterialWhereUniqueInputSchema;
