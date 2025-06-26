import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientPreferenceWhereInputSchema } from './ClientPreferenceWhereInputSchema';

export const ClientPreferenceListRelationFilterSchema: z.ZodType<Prisma.ClientPreferenceListRelationFilter> = z.object({
  every: z.lazy(() => ClientPreferenceWhereInputSchema).optional(),
  some: z.lazy(() => ClientPreferenceWhereInputSchema).optional(),
  none: z.lazy(() => ClientPreferenceWhereInputSchema).optional()
}).strict();

export default ClientPreferenceListRelationFilterSchema;
