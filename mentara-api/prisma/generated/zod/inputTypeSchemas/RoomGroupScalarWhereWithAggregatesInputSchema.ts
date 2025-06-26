import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';

export const RoomGroupScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.RoomGroupScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => RoomGroupScalarWhereWithAggregatesInputSchema),z.lazy(() => RoomGroupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomGroupScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomGroupScalarWhereWithAggregatesInputSchema),z.lazy(() => RoomGroupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  order: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  communityId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export default RoomGroupScalarWhereWithAggregatesInputSchema;
