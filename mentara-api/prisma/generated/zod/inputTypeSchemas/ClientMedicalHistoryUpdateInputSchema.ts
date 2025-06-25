import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { ClientUpdateOneRequiredWithoutClientMedicalHistoryNestedInputSchema } from './ClientUpdateOneRequiredWithoutClientMedicalHistoryNestedInputSchema';

export const ClientMedicalHistoryUpdateInputSchema: z.ZodType<Prisma.ClientMedicalHistoryUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  condition: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  client: z.lazy(() => ClientUpdateOneRequiredWithoutClientMedicalHistoryNestedInputSchema).optional()
}).strict();

export default ClientMedicalHistoryUpdateInputSchema;
