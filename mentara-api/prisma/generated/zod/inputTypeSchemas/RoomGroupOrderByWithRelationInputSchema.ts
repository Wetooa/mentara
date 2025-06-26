import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { CommunityOrderByWithRelationInputSchema } from './CommunityOrderByWithRelationInputSchema';
import { RoomOrderByRelationAggregateInputSchema } from './RoomOrderByRelationAggregateInputSchema';

export const RoomGroupOrderByWithRelationInputSchema: z.ZodType<Prisma.RoomGroupOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  order: z.lazy(() => SortOrderSchema).optional(),
  communityId: z.lazy(() => SortOrderSchema).optional(),
  community: z.lazy(() => CommunityOrderByWithRelationInputSchema).optional(),
  rooms: z.lazy(() => RoomOrderByRelationAggregateInputSchema).optional()
}).strict();

export default RoomGroupOrderByWithRelationInputSchema;
