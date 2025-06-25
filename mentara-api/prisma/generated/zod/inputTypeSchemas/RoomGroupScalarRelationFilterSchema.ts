import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomGroupWhereInputSchema } from './RoomGroupWhereInputSchema';

export const RoomGroupScalarRelationFilterSchema: z.ZodType<Prisma.RoomGroupScalarRelationFilter> = z.object({
  is: z.lazy(() => RoomGroupWhereInputSchema).optional(),
  isNot: z.lazy(() => RoomGroupWhereInputSchema).optional()
}).strict();

export default RoomGroupScalarRelationFilterSchema;
