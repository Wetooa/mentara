import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionCreateNestedManyWithoutWorksheetInputSchema } from './WorksheetSubmissionCreateNestedManyWithoutWorksheetInputSchema';
import { ClientCreateNestedOneWithoutWorksheetsInputSchema } from './ClientCreateNestedOneWithoutWorksheetsInputSchema';
import { TherapistCreateNestedOneWithoutWorksheetsInputSchema } from './TherapistCreateNestedOneWithoutWorksheetsInputSchema';

export const WorksheetCreateWithoutMaterialsInputSchema: z.ZodType<Prisma.WorksheetCreateWithoutMaterialsInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  submissions: z.lazy(() => WorksheetSubmissionCreateNestedManyWithoutWorksheetInputSchema).optional(),
  client: z.lazy(() => ClientCreateNestedOneWithoutWorksheetsInputSchema),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutWorksheetsInputSchema).optional()
}).strict();

export default WorksheetCreateWithoutMaterialsInputSchema;
