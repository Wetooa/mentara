import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ClientOrderByWithRelationInputSchema } from './ClientOrderByWithRelationInputSchema';

export const ClientMedicalHistoryOrderByWithRelationInputSchema: z.ZodType<Prisma.ClientMedicalHistoryOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  clientId: z.lazy(() => SortOrderSchema).optional(),
  condition: z.lazy(() => SortOrderSchema).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  client: z.lazy(() => ClientOrderByWithRelationInputSchema).optional()
}).strict();

export default ClientMedicalHistoryOrderByWithRelationInputSchema;
