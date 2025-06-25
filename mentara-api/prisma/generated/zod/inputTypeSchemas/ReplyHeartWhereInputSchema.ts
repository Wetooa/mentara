import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ReplyScalarRelationFilterSchema } from './ReplyScalarRelationFilterSchema';
import { ReplyWhereInputSchema } from './ReplyWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const ReplyHeartWhereInputSchema: z.ZodType<Prisma.ReplyHeartWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReplyHeartWhereInputSchema),z.lazy(() => ReplyHeartWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyHeartWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyHeartWhereInputSchema),z.lazy(() => ReplyHeartWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  replyId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  reply: z.union([ z.lazy(() => ReplyScalarRelationFilterSchema),z.lazy(() => ReplyWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export default ReplyHeartWhereInputSchema;
