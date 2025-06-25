import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialCreateNestedManyWithoutWorksheetInputSchema } from './WorksheetMaterialCreateNestedManyWithoutWorksheetInputSchema';
import { ClientCreateNestedOneWithoutWorksheetsInputSchema } from './ClientCreateNestedOneWithoutWorksheetsInputSchema';
import { TherapistCreateNestedOneWithoutWorksheetsInputSchema } from './TherapistCreateNestedOneWithoutWorksheetsInputSchema';

export const WorksheetCreateWithoutSubmissionsInputSchema: z.ZodType<Prisma.WorksheetCreateWithoutSubmissionsInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  materials: z.lazy(() => WorksheetMaterialCreateNestedManyWithoutWorksheetInputSchema).optional(),
  client: z.lazy(() => ClientCreateNestedOneWithoutWorksheetsInputSchema),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutWorksheetsInputSchema).optional()
}).strict();

export default WorksheetCreateWithoutSubmissionsInputSchema;
