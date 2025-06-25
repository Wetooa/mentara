import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { RoomGroupOrderByWithRelationInputSchema } from './RoomGroupOrderByWithRelationInputSchema';
import { PostOrderByRelationAggregateInputSchema } from './PostOrderByRelationAggregateInputSchema';

export const RoomOrderByWithRelationInputSchema: z.ZodType<Prisma.RoomOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  order: z.lazy(() => SortOrderSchema).optional(),
  roomGroupId: z.lazy(() => SortOrderSchema).optional(),
  roomGroup: z.lazy(() => RoomGroupOrderByWithRelationInputSchema).optional(),
  posts: z.lazy(() => PostOrderByRelationAggregateInputSchema).optional()
}).strict();

export default RoomOrderByWithRelationInputSchema;
