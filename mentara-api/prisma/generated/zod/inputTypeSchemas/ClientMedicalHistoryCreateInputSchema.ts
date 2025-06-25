import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateNestedOneWithoutClientMedicalHistoryInputSchema } from './ClientCreateNestedOneWithoutClientMedicalHistoryInputSchema';

export const ClientMedicalHistoryCreateInputSchema: z.ZodType<Prisma.ClientMedicalHistoryCreateInput> = z.object({
  id: z.string().uuid().optional(),
  condition: z.string(),
  notes: z.string().optional().nullable(),
  client: z.lazy(() => ClientCreateNestedOneWithoutClientMedicalHistoryInputSchema)
}).strict();

export default ClientMedicalHistoryCreateInputSchema;
