import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { ClientUpdateOneRequiredWithoutClientPreferencesNestedInputSchema } from './ClientUpdateOneRequiredWithoutClientPreferencesNestedInputSchema';

export const ClientPreferenceUpdateInputSchema: z.ZodType<Prisma.ClientPreferenceUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  key: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  client: z.lazy(() => ClientUpdateOneRequiredWithoutClientPreferencesNestedInputSchema).optional()
}).strict();

export default ClientPreferenceUpdateInputSchema;
