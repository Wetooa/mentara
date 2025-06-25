import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomWhereInputSchema } from './RoomWhereInputSchema';

export const RoomNullableScalarRelationFilterSchema: z.ZodType<Prisma.RoomNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => RoomWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => RoomWhereInputSchema).optional().nullable()
}).strict();

export default RoomNullableScalarRelationFilterSchema;
