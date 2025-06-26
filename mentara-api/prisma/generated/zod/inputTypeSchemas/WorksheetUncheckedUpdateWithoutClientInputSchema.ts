import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { WorksheetMaterialUncheckedUpdateManyWithoutWorksheetNestedInputSchema } from './WorksheetMaterialUncheckedUpdateManyWithoutWorksheetNestedInputSchema';
import { WorksheetSubmissionUncheckedUpdateManyWithoutWorksheetNestedInputSchema } from './WorksheetSubmissionUncheckedUpdateManyWithoutWorksheetNestedInputSchema';

export const WorksheetUncheckedUpdateWithoutClientInputSchema: z.ZodType<Prisma.WorksheetUncheckedUpdateWithoutClientInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  therapistId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  materials: z.lazy(() => WorksheetMaterialUncheckedUpdateManyWithoutWorksheetNestedInputSchema).optional(),
  submissions: z.lazy(() => WorksheetSubmissionUncheckedUpdateManyWithoutWorksheetNestedInputSchema).optional()
}).strict();

export default WorksheetUncheckedUpdateWithoutClientInputSchema;
