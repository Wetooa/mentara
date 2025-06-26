import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RoomWhereInputSchema } from './RoomWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { RoomGroupScalarRelationFilterSchema } from './RoomGroupScalarRelationFilterSchema';
import { RoomGroupWhereInputSchema } from './RoomGroupWhereInputSchema';
import { PostListRelationFilterSchema } from './PostListRelationFilterSchema';

export const RoomWhereUniqueInputSchema: z.ZodType<Prisma.RoomWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => RoomWhereInputSchema),z.lazy(() => RoomWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomWhereInputSchema),z.lazy(() => RoomWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  order: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  roomGroupId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  roomGroup: z.union([ z.lazy(() => RoomGroupScalarRelationFilterSchema),z.lazy(() => RoomGroupWhereInputSchema) ]).optional(),
  posts: z.lazy(() => PostListRelationFilterSchema).optional()
}).strict());

export default RoomWhereUniqueInputSchema;
