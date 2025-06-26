import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistWhereInputSchema } from './ClientTherapistWhereInputSchema';

export const ClientTherapistListRelationFilterSchema: z.ZodType<Prisma.ClientTherapistListRelationFilter> = z.object({
  every: z.lazy(() => ClientTherapistWhereInputSchema).optional(),
  some: z.lazy(() => ClientTherapistWhereInputSchema).optional(),
  none: z.lazy(() => ClientTherapistWhereInputSchema).optional()
}).strict();

export default ClientTherapistListRelationFilterSchema;
