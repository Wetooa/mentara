import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema: z.ZodType<Prisma.ClientMedicalHistoryUncheckedCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  condition: z.string(),
  notes: z.string().optional().nullable()
}).strict();

export default ClientMedicalHistoryUncheckedCreateWithoutClientInputSchema;
