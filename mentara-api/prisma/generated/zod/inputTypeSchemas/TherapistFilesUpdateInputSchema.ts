import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { TherapistUpdateOneRequiredWithoutTherapistFilesNestedInputSchema } from './TherapistUpdateOneRequiredWithoutTherapistFilesNestedInputSchema';

export const TherapistFilesUpdateInputSchema: z.ZodType<Prisma.TherapistFilesUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fileUrl: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  therapist: z.lazy(() => TherapistUpdateOneRequiredWithoutTherapistFilesNestedInputSchema).optional()
}).strict();

export default TherapistFilesUpdateInputSchema;
