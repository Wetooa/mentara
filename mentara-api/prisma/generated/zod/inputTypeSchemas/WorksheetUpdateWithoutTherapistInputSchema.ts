import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { WorksheetMaterialUpdateManyWithoutWorksheetNestedInputSchema } from './WorksheetMaterialUpdateManyWithoutWorksheetNestedInputSchema';
import { WorksheetSubmissionUpdateManyWithoutWorksheetNestedInputSchema } from './WorksheetSubmissionUpdateManyWithoutWorksheetNestedInputSchema';
import { ClientUpdateOneRequiredWithoutWorksheetsNestedInputSchema } from './ClientUpdateOneRequiredWithoutWorksheetsNestedInputSchema';

export const WorksheetUpdateWithoutTherapistInputSchema: z.ZodType<Prisma.WorksheetUpdateWithoutTherapistInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  materials: z.lazy(() => WorksheetMaterialUpdateManyWithoutWorksheetNestedInputSchema).optional(),
  submissions: z.lazy(() => WorksheetSubmissionUpdateManyWithoutWorksheetNestedInputSchema).optional(),
  client: z.lazy(() => ClientUpdateOneRequiredWithoutWorksheetsNestedInputSchema).optional()
}).strict();

export default WorksheetUpdateWithoutTherapistInputSchema;
