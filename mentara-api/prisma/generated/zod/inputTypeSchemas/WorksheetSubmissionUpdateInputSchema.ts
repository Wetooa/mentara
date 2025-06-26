import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableIntFieldUpdateOperationsInputSchema } from './NullableIntFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { WorksheetUpdateOneRequiredWithoutSubmissionsNestedInputSchema } from './WorksheetUpdateOneRequiredWithoutSubmissionsNestedInputSchema';
import { ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema } from './ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema';

export const WorksheetSubmissionUpdateInputSchema: z.ZodType<Prisma.WorksheetSubmissionUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filename: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileSize: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  fileType: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  worksheet: z.lazy(() => WorksheetUpdateOneRequiredWithoutSubmissionsNestedInputSchema).optional(),
  client: z.lazy(() => ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema).optional()
}).strict();

export default WorksheetSubmissionUpdateInputSchema;
