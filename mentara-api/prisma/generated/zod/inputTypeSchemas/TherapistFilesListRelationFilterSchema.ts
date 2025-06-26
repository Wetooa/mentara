import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistFilesWhereInputSchema } from './TherapistFilesWhereInputSchema';

export const TherapistFilesListRelationFilterSchema: z.ZodType<Prisma.TherapistFilesListRelationFilter> = z.object({
  every: z.lazy(() => TherapistFilesWhereInputSchema).optional(),
  some: z.lazy(() => TherapistFilesWhereInputSchema).optional(),
  none: z.lazy(() => TherapistFilesWhereInputSchema).optional()
}).strict();

export default TherapistFilesListRelationFilterSchema;
