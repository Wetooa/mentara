import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetMaterialCreateWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetMaterialCreateWithoutWorksheetInput> = z.object({
  id: z.string().uuid().optional(),
  url: z.string(),
  type: z.string().optional().nullable()
}).strict();

export default WorksheetMaterialCreateWithoutWorksheetInputSchema;
