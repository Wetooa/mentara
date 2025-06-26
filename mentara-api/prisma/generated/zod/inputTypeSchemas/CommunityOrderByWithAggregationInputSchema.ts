import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { CommunityCountOrderByAggregateInputSchema } from './CommunityCountOrderByAggregateInputSchema';
import { CommunityMaxOrderByAggregateInputSchema } from './CommunityMaxOrderByAggregateInputSchema';
import { CommunityMinOrderByAggregateInputSchema } from './CommunityMinOrderByAggregateInputSchema';

export const CommunityOrderByWithAggregationInputSchema: z.ZodType<Prisma.CommunityOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CommunityCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CommunityMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CommunityMinOrderByAggregateInputSchema).optional()
}).strict();

export default CommunityOrderByWithAggregationInputSchema;
