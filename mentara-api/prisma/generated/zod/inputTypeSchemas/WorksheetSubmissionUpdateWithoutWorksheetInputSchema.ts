import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema } from './ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema';

export const WorksheetSubmissionUpdateWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetSubmissionUpdateWithoutWorksheetInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  client: z.lazy(() => ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema).optional()
}).strict();

export default WorksheetSubmissionUpdateWithoutWorksheetInputSchema;
