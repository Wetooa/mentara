import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateNestedOneWithoutRepliesInputSchema } from './CommentCreateNestedOneWithoutRepliesInputSchema';
import { UserCreateNestedOneWithoutRepliesInputSchema } from './UserCreateNestedOneWithoutRepliesInputSchema';
import { ReplyHeartCreateNestedManyWithoutReplyInputSchema } from './ReplyHeartCreateNestedManyWithoutReplyInputSchema';

export const ReplyCreateWithoutFilesInputSchema: z.ZodType<Prisma.ReplyCreateWithoutFilesInput> = z.object({
  id: z.string().uuid().optional(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  comment: z.lazy(() => CommentCreateNestedOneWithoutRepliesInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutRepliesInputSchema),
  hearts: z.lazy(() => ReplyHeartCreateNestedManyWithoutReplyInputSchema).optional()
}).strict();

export default ReplyCreateWithoutFilesInputSchema;
