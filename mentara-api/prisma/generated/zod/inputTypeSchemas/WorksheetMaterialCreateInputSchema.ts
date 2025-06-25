import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateNestedOneWithoutMaterialsInputSchema } from './WorksheetCreateNestedOneWithoutMaterialsInputSchema';

export const WorksheetMaterialCreateInputSchema: z.ZodType<Prisma.WorksheetMaterialCreateInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable(),
  worksheet: z.lazy(() => WorksheetCreateNestedOneWithoutMaterialsInputSchema)
}).strict();

export default WorksheetMaterialCreateInputSchema;
