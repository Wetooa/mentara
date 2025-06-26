import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateNestedOneWithoutRepliesInputSchema } from './CommentCreateNestedOneWithoutRepliesInputSchema';
import { UserCreateNestedOneWithoutRepliesInputSchema } from './UserCreateNestedOneWithoutRepliesInputSchema';
import { ReplyFileCreateNestedManyWithoutReplyInputSchema } from './ReplyFileCreateNestedManyWithoutReplyInputSchema';

export const ReplyCreateWithoutHeartsInputSchema: z.ZodType<Prisma.ReplyCreateWithoutHeartsInput> = z.object({
  id: z.string().uuid().optional(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  comment: z.lazy(() => CommentCreateNestedOneWithoutRepliesInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutRepliesInputSchema),
  files: z.lazy(() => ReplyFileCreateNestedManyWithoutReplyInputSchema).optional()
}).strict();

export default ReplyCreateWithoutHeartsInputSchema;
