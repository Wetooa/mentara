import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"

export const ClientMedicalHistorySelectSchema: z.ZodType<Prisma.ClientMedicalHistorySelect> = z.object({
  id: z.boolean().optional(),
  clientId: z.boolean().optional(),
  condition: z.boolean().optional(),
  notes: z.boolean().optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export default ClientMedicalHistorySelectSchema;
