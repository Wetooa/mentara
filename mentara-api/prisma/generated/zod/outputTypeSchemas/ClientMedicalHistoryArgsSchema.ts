import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientMedicalHistorySelectSchema } from '../inputTypeSchemas/ClientMedicalHistorySelectSchema';
import { ClientMedicalHistoryIncludeSchema } from '../inputTypeSchemas/ClientMedicalHistoryIncludeSchema';

export const ClientMedicalHistoryArgsSchema: z.ZodType<Prisma.ClientMedicalHistoryDefaultArgs> = z.object({
  select: z.lazy(() => ClientMedicalHistorySelectSchema).optional(),
  include: z.lazy(() => ClientMedicalHistoryIncludeSchema).optional(),
}).strict();

export default ClientMedicalHistoryArgsSchema;
