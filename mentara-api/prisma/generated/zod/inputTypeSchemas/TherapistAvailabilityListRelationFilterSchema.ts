import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistAvailabilityWhereInputSchema } from './TherapistAvailabilityWhereInputSchema';

export const TherapistAvailabilityListRelationFilterSchema: z.ZodType<Prisma.TherapistAvailabilityListRelationFilter> = z.object({
  every: z.lazy(() => TherapistAvailabilityWhereInputSchema).optional(),
  some: z.lazy(() => TherapistAvailabilityWhereInputSchema).optional(),
  none: z.lazy(() => TherapistAvailabilityWhereInputSchema).optional()
}).strict();

export default TherapistAvailabilityListRelationFilterSchema;
