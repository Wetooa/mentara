import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateNestedOneWithoutAssignedTherapistsInputSchema } from './ClientCreateNestedOneWithoutAssignedTherapistsInputSchema';
import { TherapistCreateNestedOneWithoutAssignedClientsInputSchema } from './TherapistCreateNestedOneWithoutAssignedClientsInputSchema';

export const ClientTherapistCreateInputSchema: z.ZodType<Prisma.ClientTherapistCreateInput> = z.object({
  id: z.string().uuid().optional(),
  assignedAt: z.coerce.date().optional(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  score: z.number().int().optional().nullable(),
  client: z.lazy(() => ClientCreateNestedOneWithoutAssignedTherapistsInputSchema),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutAssignedClientsInputSchema)
}).strict();

export default ClientTherapistCreateInputSchema;
