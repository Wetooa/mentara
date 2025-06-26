import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { TherapistOrderByRelationAggregateInputSchema } from './TherapistOrderByRelationAggregateInputSchema';

export const AdminOrderByWithRelationInputSchema: z.ZodType<Prisma.AdminOrderByWithRelationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  permissions: z.lazy(() => SortOrderSchema).optional(),
  adminLevel: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  processedTherapists: z.lazy(() => TherapistOrderByRelationAggregateInputSchema).optional()
}).strict();

export default AdminOrderByWithRelationInputSchema;
