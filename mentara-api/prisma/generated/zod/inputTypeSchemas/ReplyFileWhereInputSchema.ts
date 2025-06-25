import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { ReplyScalarRelationFilterSchema } from './ReplyScalarRelationFilterSchema';
import { ReplyWhereInputSchema } from './ReplyWhereInputSchema';

export const ReplyFileWhereInputSchema: z.ZodType<Prisma.ReplyFileWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReplyFileWhereInputSchema),z.lazy(() => ReplyFileWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyFileWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyFileWhereInputSchema),z.lazy(() => ReplyFileWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  replyId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  reply: z.union([ z.lazy(() => ReplyScalarRelationFilterSchema),z.lazy(() => ReplyWhereInputSchema) ]).optional(),
}).strict();

export default ReplyFileWhereInputSchema;
