import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const WorksheetCountOutputTypeSelectSchema: z.ZodType<Prisma.WorksheetCountOutputTypeSelect> = z.object({
  materials: z.boolean().optional(),
  submissions: z.boolean().optional(),
}).strict();

export default WorksheetCountOutputTypeSelectSchema;
