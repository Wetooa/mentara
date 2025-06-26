import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const WorksheetMaterialScalarWhereInputSchema: z.ZodType<Prisma.WorksheetMaterialScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WorksheetMaterialScalarWhereInputSchema),z.lazy(() => WorksheetMaterialScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorksheetMaterialScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorksheetMaterialScalarWhereInputSchema),z.lazy(() => WorksheetMaterialScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  worksheetId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  filename: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  fileSize: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  fileType: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default WorksheetMaterialScalarWhereInputSchema;
