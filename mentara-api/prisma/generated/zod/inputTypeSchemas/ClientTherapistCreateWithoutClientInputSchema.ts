import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateNestedOneWithoutAssignedClientsInputSchema } from './TherapistCreateNestedOneWithoutAssignedClientsInputSchema';

export const ClientTherapistCreateWithoutClientInputSchema: z.ZodType<Prisma.ClientTherapistCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  assignedAt: z.coerce.date().optional(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  score: z.number().int().optional().nullable(),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutAssignedClientsInputSchema)
}).strict();

export default ClientTherapistCreateWithoutClientInputSchema;
