import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { WorksheetSubmissionUpdateManyWithoutWorksheetNestedInputSchema } from './WorksheetSubmissionUpdateManyWithoutWorksheetNestedInputSchema';
import { ClientUpdateOneRequiredWithoutWorksheetsNestedInputSchema } from './ClientUpdateOneRequiredWithoutWorksheetsNestedInputSchema';
import { TherapistUpdateOneWithoutWorksheetsNestedInputSchema } from './TherapistUpdateOneWithoutWorksheetsNestedInputSchema';

export const WorksheetUpdateWithoutMaterialsInputSchema: z.ZodType<Prisma.WorksheetUpdateWithoutMaterialsInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instructions: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  dueDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isCompleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  submittedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  feedback: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  submissions: z.lazy(() => WorksheetSubmissionUpdateManyWithoutWorksheetNestedInputSchema).optional(),
  client: z.lazy(() => ClientUpdateOneRequiredWithoutWorksheetsNestedInputSchema).optional(),
  therapist: z.lazy(() => TherapistUpdateOneWithoutWorksheetsNestedInputSchema).optional()
}).strict();

export default WorksheetUpdateWithoutMaterialsInputSchema;
