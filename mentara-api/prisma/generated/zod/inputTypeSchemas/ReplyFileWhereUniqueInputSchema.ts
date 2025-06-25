import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyFileWhereInputSchema } from './ReplyFileWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { ReplyScalarRelationFilterSchema } from './ReplyScalarRelationFilterSchema';
import { ReplyWhereInputSchema } from './ReplyWhereInputSchema';

export const ReplyFileWhereUniqueInputSchema: z.ZodType<Prisma.ReplyFileWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => ReplyFileWhereInputSchema),z.lazy(() => ReplyFileWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyFileWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyFileWhereInputSchema),z.lazy(() => ReplyFileWhereInputSchema).array() ]).optional(),
  replyId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  reply: z.union([ z.lazy(() => ReplyScalarRelationFilterSchema),z.lazy(() => ReplyWhereInputSchema) ]).optional(),
}).strict());

export default ReplyFileWhereUniqueInputSchema;
