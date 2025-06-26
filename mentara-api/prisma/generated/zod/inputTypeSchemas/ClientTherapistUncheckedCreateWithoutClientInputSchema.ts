import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientTherapistUncheckedCreateWithoutClientInputSchema: z.ZodType<Prisma.ClientTherapistUncheckedCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  therapistId: z.string(),
  assignedAt: z.coerce.date().optional(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  score: z.number().int().optional().nullable()
}).strict();

export default ClientTherapistUncheckedCreateWithoutClientInputSchema;
