import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientMedicalHistoryCreateManyInputSchema: z.ZodType<Prisma.ClientMedicalHistoryCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  condition: z.string(),
  notes: z.string().optional().nullable()
}).strict();

export default ClientMedicalHistoryCreateManyInputSchema;
