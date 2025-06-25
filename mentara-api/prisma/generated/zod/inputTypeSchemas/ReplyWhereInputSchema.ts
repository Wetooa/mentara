import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { CommentScalarRelationFilterSchema } from './CommentScalarRelationFilterSchema';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { ReplyHeartListRelationFilterSchema } from './ReplyHeartListRelationFilterSchema';
import { ReplyFileListRelationFilterSchema } from './ReplyFileListRelationFilterSchema';

export const ReplyWhereInputSchema: z.ZodType<Prisma.ReplyWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReplyWhereInputSchema),z.lazy(() => ReplyWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyWhereInputSchema),z.lazy(() => ReplyWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  commentId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  comment: z.union([ z.lazy(() => CommentScalarRelationFilterSchema),z.lazy(() => CommentWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  hearts: z.lazy(() => ReplyHeartListRelationFilterSchema).optional(),
  files: z.lazy(() => ReplyFileListRelationFilterSchema).optional()
}).strict();

export default ReplyWhereInputSchema;
