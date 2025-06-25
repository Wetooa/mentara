import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { CommunityScalarRelationFilterSchema } from './CommunityScalarRelationFilterSchema';
import { CommunityWhereInputSchema } from './CommunityWhereInputSchema';
import { RoomListRelationFilterSchema } from './RoomListRelationFilterSchema';

export const RoomGroupWhereInputSchema: z.ZodType<Prisma.RoomGroupWhereInput> = z.object({
  AND: z.union([ z.lazy(() => RoomGroupWhereInputSchema),z.lazy(() => RoomGroupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RoomGroupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RoomGroupWhereInputSchema),z.lazy(() => RoomGroupWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  order: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  communityId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  community: z.union([ z.lazy(() => CommunityScalarRelationFilterSchema),z.lazy(() => CommunityWhereInputSchema) ]).optional(),
  rooms: z.lazy(() => RoomListRelationFilterSchema).optional()
}).strict();

export default RoomGroupWhereInputSchema;
