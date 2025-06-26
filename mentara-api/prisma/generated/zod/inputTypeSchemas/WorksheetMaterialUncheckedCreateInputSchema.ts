import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetMaterialUncheckedCreateInputSchema: z.ZodType<Prisma.WorksheetMaterialUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  worksheetId: z.string(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default WorksheetMaterialUncheckedCreateInputSchema;
