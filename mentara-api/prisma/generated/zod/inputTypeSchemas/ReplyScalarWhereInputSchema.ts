import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const ReplyScalarWhereInputSchema: z.ZodType<Prisma.ReplyScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReplyScalarWhereInputSchema),z.lazy(() => ReplyScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyScalarWhereInputSchema),z.lazy(() => ReplyScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  commentId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default ReplyScalarWhereInputSchema;
