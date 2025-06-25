import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientMedicalHistoryCreateWithoutClientInputSchema: z.ZodType<Prisma.ClientMedicalHistoryCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  condition: z.string(),
  notes: z.string().optional().nullable()
}).strict();

export default ClientMedicalHistoryCreateWithoutClientInputSchema;
