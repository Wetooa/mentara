import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema } from './WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema';

export const WorksheetUncheckedCreateWithoutSubmissionsInputSchema: z.ZodType<Prisma.WorksheetUncheckedCreateWithoutSubmissionsInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  therapistId: z.string().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  materials: z.lazy(() => WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema).optional()
}).strict();

export default WorksheetUncheckedCreateWithoutSubmissionsInputSchema;
