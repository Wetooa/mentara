import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistListRelationFilterSchema: z.ZodType<Prisma.TherapistListRelationFilter> = z.object({
  every: z.lazy(() => TherapistWhereInputSchema).optional(),
  some: z.lazy(() => TherapistWhereInputSchema).optional(),
  none: z.lazy(() => TherapistWhereInputSchema).optional()
}).strict();

export default TherapistListRelationFilterSchema;
