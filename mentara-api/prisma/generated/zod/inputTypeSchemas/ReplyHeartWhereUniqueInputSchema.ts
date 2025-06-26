import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartReplyIdUserIdCompoundUniqueInputSchema } from './ReplyHeartReplyIdUserIdCompoundUniqueInputSchema';
import { ReplyHeartWhereInputSchema } from './ReplyHeartWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ReplyScalarRelationFilterSchema } from './ReplyScalarRelationFilterSchema';
import { ReplyWhereInputSchema } from './ReplyWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const ReplyHeartWhereUniqueInputSchema: z.ZodType<Prisma.ReplyHeartWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    replyId_userId: z.lazy(() => ReplyHeartReplyIdUserIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    replyId_userId: z.lazy(() => ReplyHeartReplyIdUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  replyId_userId: z.lazy(() => ReplyHeartReplyIdUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ReplyHeartWhereInputSchema),z.lazy(() => ReplyHeartWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyHeartWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyHeartWhereInputSchema),z.lazy(() => ReplyHeartWhereInputSchema).array() ]).optional(),
  replyId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  reply: z.union([ z.lazy(() => ReplyScalarRelationFilterSchema),z.lazy(() => ReplyWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export default ReplyHeartWhereUniqueInputSchema;
