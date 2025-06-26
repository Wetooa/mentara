import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';

export const RoomGroupScalarWhereInputSchema: z.ZodType<Prisma.RoomGroupScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => RoomGroupScalarWhereInputSchema),z.lazy(() => RoomGroupScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomGroupScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomGroupScalarWhereInputSchema),z.lazy(() => RoomGroupScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  order: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  communityId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export default RoomGroupScalarWhereInputSchema;
