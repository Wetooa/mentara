import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientMedicalHistoryWhereInputSchema } from './ClientMedicalHistoryWhereInputSchema';

export const ClientMedicalHistoryListRelationFilterSchema: z.ZodType<Prisma.ClientMedicalHistoryListRelationFilter> = z.object({
  every: z.lazy(() => ClientMedicalHistoryWhereInputSchema).optional(),
  some: z.lazy(() => ClientMedicalHistoryWhereInputSchema).optional(),
  none: z.lazy(() => ClientMedicalHistoryWhereInputSchema).optional()
}).strict();

export default ClientMedicalHistoryListRelationFilterSchema;
