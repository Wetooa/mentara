import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistScalarRelationFilterSchema: z.ZodType<Prisma.TherapistScalarRelationFilter> = z.object({
  is: z.lazy(() => TherapistWhereInputSchema).optional(),
  isNot: z.lazy(() => TherapistWhereInputSchema).optional()
}).strict();

export default TherapistScalarRelationFilterSchema;
