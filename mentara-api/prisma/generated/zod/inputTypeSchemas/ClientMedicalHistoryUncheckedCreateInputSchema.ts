import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientMedicalHistoryUncheckedCreateInputSchema: z.ZodType<Prisma.ClientMedicalHistoryUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  condition: z.string(),
  notes: z.string().optional().nullable()
}).strict();

export default ClientMedicalHistoryUncheckedCreateInputSchema;
