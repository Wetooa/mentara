import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientMedicalHistoryCreateManyClientInputSchema: z.ZodType<Prisma.ClientMedicalHistoryCreateManyClientInput> = z.object({
  id: z.string().uuid().optional(),
  condition: z.string(),
  notes: z.string().optional().nullable()
}).strict();

export default ClientMedicalHistoryCreateManyClientInputSchema;
