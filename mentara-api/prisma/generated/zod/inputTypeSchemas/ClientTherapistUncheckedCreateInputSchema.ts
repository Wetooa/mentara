import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientTherapistUncheckedCreateInputSchema: z.ZodType<Prisma.ClientTherapistUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  therapistId: z.string(),
  assignedAt: z.coerce.date().optional(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  score: z.number().int().optional().nullable()
}).strict();

export default ClientTherapistUncheckedCreateInputSchema;
