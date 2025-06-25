import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupWhereInputSchema } from './RoomGroupWhereInputSchema';

export const RoomGroupListRelationFilterSchema: z.ZodType<Prisma.RoomGroupListRelationFilter> = z.object({
  every: z.lazy(() => RoomGroupWhereInputSchema).optional(),
  some: z.lazy(() => RoomGroupWhereInputSchema).optional(),
  none: z.lazy(() => RoomGroupWhereInputSchema).optional()
}).strict();

export default RoomGroupListRelationFilterSchema;
