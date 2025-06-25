import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const ReplyFileScalarWhereInputSchema: z.ZodType<Prisma.ReplyFileScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReplyFileScalarWhereInputSchema),z.lazy(() => ReplyFileScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyFileScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyFileScalarWhereInputSchema),z.lazy(() => ReplyFileScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  replyId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default ReplyFileScalarWhereInputSchema;
