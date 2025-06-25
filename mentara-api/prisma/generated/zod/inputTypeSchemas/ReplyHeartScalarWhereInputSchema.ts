import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const ReplyHeartScalarWhereInputSchema: z.ZodType<Prisma.ReplyHeartScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReplyHeartScalarWhereInputSchema),z.lazy(() => ReplyHeartScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyHeartScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyHeartScalarWhereInputSchema),z.lazy(() => ReplyHeartScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  replyId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default ReplyHeartScalarWhereInputSchema;
