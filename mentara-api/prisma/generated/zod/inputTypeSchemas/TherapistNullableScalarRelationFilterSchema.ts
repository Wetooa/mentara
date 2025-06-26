import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistNullableScalarRelationFilterSchema: z.ZodType<Prisma.TherapistNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => TherapistWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => TherapistWhereInputSchema).optional().nullable()
}).strict();

export default TherapistNullableScalarRelationFilterSchema;
