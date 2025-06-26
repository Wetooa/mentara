import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialCreateNestedManyWithoutWorksheetInputSchema } from './WorksheetMaterialCreateNestedManyWithoutWorksheetInputSchema';
import { WorksheetSubmissionCreateNestedManyWithoutWorksheetInputSchema } from './WorksheetSubmissionCreateNestedManyWithoutWorksheetInputSchema';
import { ClientCreateNestedOneWithoutWorksheetsInputSchema } from './ClientCreateNestedOneWithoutWorksheetsInputSchema';

export const WorksheetCreateWithoutTherapistInputSchema: z.ZodType<Prisma.WorksheetCreateWithoutTherapistInput> = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  instructions: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  dueDate: z.coerce.date(),
  status: z.string().optional(),
  isCompleted: z.boolean().optional(),
  submittedAt: z.coerce.date().optional().nullable(),
  feedback: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  materials: z.lazy(() => WorksheetMaterialCreateNestedManyWithoutWorksheetInputSchema).optional(),
  submissions: z.lazy(() => WorksheetSubmissionCreateNestedManyWithoutWorksheetInputSchema).optional(),
  client: z.lazy(() => ClientCreateNestedOneWithoutWorksheetsInputSchema)
}).strict();

export default WorksheetCreateWithoutTherapistInputSchema;
