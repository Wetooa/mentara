import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"

export const ClientTherapistSelectSchema: z.ZodType<Prisma.ClientTherapistSelect> = z.object({
  id: z.boolean().optional(),
  clientId: z.boolean().optional(),
  therapistId: z.boolean().optional(),
  assignedAt: z.boolean().optional(),
  status: z.boolean().optional(),
  notes: z.boolean().optional(),
  score: z.boolean().optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
}).strict()

export default ClientTherapistSelectSchema;
