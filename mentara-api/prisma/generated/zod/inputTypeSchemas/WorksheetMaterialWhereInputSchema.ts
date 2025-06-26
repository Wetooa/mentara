import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { WorksheetScalarRelationFilterSchema } from './WorksheetScalarRelationFilterSchema';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';

export const WorksheetMaterialWhereInputSchema: z.ZodType<Prisma.WorksheetMaterialWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetMaterialWhereInputSchema),z.lazy(() => WorksheetMaterialWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetMaterialWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetMaterialWhereInputSchema),z.lazy(() => WorksheetMaterialWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  filename: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileSize: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  fileType: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  worksheet: z.union([ z.lazy(() => WorksheetScalarRelationFilterSchema),z.lazy(() => WorksheetWhereInputSchema) ]).optional(),
}).strict();

export default WorksheetMaterialWhereInputSchema;
