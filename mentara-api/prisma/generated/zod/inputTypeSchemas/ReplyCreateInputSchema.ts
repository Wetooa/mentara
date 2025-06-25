import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateNestedOneWithoutRepliesInputSchema } from './CommentCreateNestedOneWithoutRepliesInputSchema';
import { UserCreateNestedOneWithoutRepliesInputSchema } from './UserCreateNestedOneWithoutRepliesInputSchema';
import { ReplyHeartCreateNestedManyWithoutReplyInputSchema } from './ReplyHeartCreateNestedManyWithoutReplyInputSchema';
import { ReplyFileCreateNestedManyWithoutReplyInputSchema } from './ReplyFileCreateNestedManyWithoutReplyInputSchema';

export const ReplyCreateInputSchema: z.ZodType<Prisma.ReplyCreateInput> = z.object({
  id: z.string().uuid().optional(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  comment: z.lazy(() => CommentCreateNestedOneWithoutRepliesInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutRepliesInputSchema),
  hearts: z.lazy(() => ReplyHeartCreateNestedManyWithoutReplyInputSchema).optional(),
  files: z.lazy(() => ReplyFileCreateNestedManyWithoutReplyInputSchema).optional()
}).strict();

export default ReplyCreateInputSchema;
