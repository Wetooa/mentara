import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { RoomGroupScalarRelationFilterSchema } from './RoomGroupScalarRelationFilterSchema';
import { RoomGroupWhereInputSchema } from './RoomGroupWhereInputSchema';
import { PostListRelationFilterSchema } from './PostListRelationFilterSchema';

export const RoomWhereInputSchema: z.ZodType<Prisma.RoomWhereInput> = z.object({
  AND: z.union([ z.lazy(() => RoomWhereInputSchema),z.lazy(() => RoomWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomWhereInputSchema),z.lazy(() => RoomWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  order: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  roomGroupId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  roomGroup: z.union([ z.lazy(() => RoomGroupScalarRelationFilterSchema),z.lazy(() => RoomGroupWhereInputSchema) ]).optional(),
  posts: z.lazy(() => PostListRelationFilterSchema).optional()
}).strict();

export default RoomWhereInputSchema;
