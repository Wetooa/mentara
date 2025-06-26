import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"

export const ClientPreferenceSelectSchema: z.ZodType<Prisma.ClientPreferenceSelect> = z.object({
  id: z.boolean().optional(),
  clientId: z.boolean().optional(),
  key: z.boolean().optional(),
  value: z.boolean().optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export default ClientPreferenceSelectSchema;
