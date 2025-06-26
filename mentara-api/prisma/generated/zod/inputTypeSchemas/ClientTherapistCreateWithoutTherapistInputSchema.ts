import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateNestedOneWithoutAssignedTherapistsInputSchema } from './ClientCreateNestedOneWithoutAssignedTherapistsInputSchema';

export const ClientTherapistCreateWithoutTherapistInputSchema: z.ZodType<Prisma.ClientTherapistCreateWithoutTherapistInput> = z.object({
  id: z.string().uuid().optional(),
  assignedAt: z.coerce.date().optional(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  score: z.number().int().optional().nullable(),
  client: z.lazy(() => ClientCreateNestedOneWithoutAssignedTherapistsInputSchema)
}).strict();

export default ClientTherapistCreateWithoutTherapistInputSchema;
