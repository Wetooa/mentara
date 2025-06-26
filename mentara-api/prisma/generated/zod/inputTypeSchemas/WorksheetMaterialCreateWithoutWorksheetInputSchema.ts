import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const WorksheetMaterialCreateWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetMaterialCreateWithoutWorksheetInput> = z.object({
  id: z.string().uuid().optional(),
  filename: z.string(),
  url: z.string(),
  fileSize: z.number().int().optional().nullable(),
  fileType: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional()
}).strict();

export default WorksheetMaterialCreateWithoutWorksheetInputSchema;
