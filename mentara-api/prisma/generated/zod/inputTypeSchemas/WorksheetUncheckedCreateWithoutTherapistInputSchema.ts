import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema } from './WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema';
import { WorksheetSubmissionUncheckedCreateNestedManyWithoutWorksheetInputSchema } from './WorksheetSubmissionUncheckedCreateNestedManyWithoutWorksheetInputSchema';

export const WorksheetUncheckedCreateWithoutTherapistInputSchema: z.ZodType<Prisma.WorksheetUncheckedCreateWithoutTherapistInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  materials: z.lazy(() => WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema).optional(),
  submissions: z.lazy(() => WorksheetSubmissionUncheckedCreateNestedManyWithoutWorksheetInputSchema).optional()
}).strict();

export default WorksheetUncheckedCreateWithoutTherapistInputSchema;
