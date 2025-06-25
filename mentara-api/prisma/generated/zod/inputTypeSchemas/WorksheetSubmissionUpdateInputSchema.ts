import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { WorksheetUpdateOneRequiredWithoutSubmissionsNestedInputSchema } from './WorksheetUpdateOneRequiredWithoutSubmissionsNestedInputSchema';
import { ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema } from './ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema';

export const WorksheetSubmissionUpdateInputSchema: z.ZodType<Prisma.WorksheetSubmissionUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  worksheet: z.lazy(() => WorksheetUpdateOneRequiredWithoutSubmissionsNestedInputSchema).optional(),
  client: z.lazy(() => ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema).optional()
}).strict();

export default WorksheetSubmissionUpdateInputSchema;
