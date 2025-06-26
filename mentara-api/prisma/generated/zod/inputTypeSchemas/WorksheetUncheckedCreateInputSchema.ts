import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema } from './WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema';
import { WorksheetSubmissionUncheckedCreateNestedManyWithoutWorksheetInputSchema } from './WorksheetSubmissionUncheckedCreateNestedManyWithoutWorksheetInputSchema';

export const WorksheetUncheckedCreateInputSchema: z.ZodType<Prisma.WorksheetUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  therapistId: z.string().optional().nullable(),
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
  materials: z.lazy(() => WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema).optional(),
  submissions: z.lazy(() => WorksheetSubmissionUncheckedCreateNestedManyWithoutWorksheetInputSchema).optional()
}).strict();

export default WorksheetUncheckedCreateInputSchema;
