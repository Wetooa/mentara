import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"

export const ClientMedicalHistoryIncludeSchema: z.ZodType<Prisma.ClientMedicalHistoryInclude> = z.object({
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export default ClientMedicalHistoryIncludeSchema;
