import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { TherapistOrderByWithRelationInputSchema } from './TherapistOrderByWithRelationInputSchema';

export const TherapistFilesOrderByWithRelationInputSchema: z.ZodType<Prisma.TherapistFilesOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  therapistId: z.lazy(() => SortOrderSchema).optional(),
  fileUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  therapist: z.lazy(() => TherapistOrderByWithRelationInputSchema).optional()
}).strict();

export default TherapistFilesOrderByWithRelationInputSchema;
