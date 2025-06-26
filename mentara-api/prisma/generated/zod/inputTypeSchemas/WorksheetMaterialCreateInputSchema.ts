import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateNestedOneWithoutMaterialsInputSchema } from './WorksheetCreateNestedOneWithoutMaterialsInputSchema';

export const WorksheetMaterialCreateInputSchema: z.ZodType<Prisma.WorksheetMaterialCreateInput> = z.object({
  id: z.string().uuid().optional(),
  filename: z.string(),
  url: z.string(),
  fileSize: z.number().int().optional().nullable(),
  fileType: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  worksheet: z.lazy(() => WorksheetCreateNestedOneWithoutMaterialsInputSchema)
}).strict();

export default WorksheetMaterialCreateInputSchema;
