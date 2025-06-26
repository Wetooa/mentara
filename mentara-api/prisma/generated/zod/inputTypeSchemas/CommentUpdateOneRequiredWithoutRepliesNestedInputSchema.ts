import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutRepliesInputSchema } from './CommentCreateWithoutRepliesInputSchema';
import { CommentUncheckedCreateWithoutRepliesInputSchema } from './CommentUncheckedCreateWithoutRepliesInputSchema';
import { CommentCreateOrConnectWithoutRepliesInputSchema } from './CommentCreateOrConnectWithoutRepliesInputSchema';
import { CommentUpsertWithoutRepliesInputSchema } from './CommentUpsertWithoutRepliesInputSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateToOneWithWhereWithoutRepliesInputSchema } from './CommentUpdateToOneWithWhereWithoutRepliesInputSchema';
import { CommentUpdateWithoutRepliesInputSchema } from './CommentUpdateWithoutRepliesInputSchema';
import { CommentUncheckedUpdateWithoutRepliesInputSchema } from './CommentUncheckedUpdateWithoutRepliesInputSchema';

export const CommentUpdateOneRequiredWithoutRepliesNestedInputSchema: z.ZodType<Prisma.CommentUpdateOneRequiredWithoutRepliesNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutRepliesInputSchema),z.lazy(() => CommentUncheckedCreateWithoutRepliesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommentCreateOrConnectWithoutRepliesInputSchema).optional(),
  upsert: z.lazy(() => CommentUpsertWithoutRepliesInputSchema).optional(),
  connect: z.lazy(() => CommentWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CommentUpdateToOneWithWhereWithoutRepliesInputSchema),z.lazy(() => CommentUpdateWithoutRepliesInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutRepliesInputSchema) ]).optional(),
}).strict();

export default CommentUpdateOneRequiredWithoutRepliesNestedInputSchema;
