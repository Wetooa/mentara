import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentFileCreateWithoutCommentInputSchema } from './CommentFileCreateWithoutCommentInputSchema';
import { CommentFileUncheckedCreateWithoutCommentInputSchema } from './CommentFileUncheckedCreateWithoutCommentInputSchema';
import { CommentFileCreateOrConnectWithoutCommentInputSchema } from './CommentFileCreateOrConnectWithoutCommentInputSchema';
import { CommentFileUpsertWithWhereUniqueWithoutCommentInputSchema } from './CommentFileUpsertWithWhereUniqueWithoutCommentInputSchema';
import { CommentFileCreateManyCommentInputEnvelopeSchema } from './CommentFileCreateManyCommentInputEnvelopeSchema';
import { CommentFileWhereUniqueInputSchema } from './CommentFileWhereUniqueInputSchema';
import { CommentFileUpdateWithWhereUniqueWithoutCommentInputSchema } from './CommentFileUpdateWithWhereUniqueWithoutCommentInputSchema';
import { CommentFileUpdateManyWithWhereWithoutCommentInputSchema } from './CommentFileUpdateManyWithWhereWithoutCommentInputSchema';
import { CommentFileScalarWhereInputSchema } from './CommentFileScalarWhereInputSchema';

export const CommentFileUpdateManyWithoutCommentNestedInputSchema: z.ZodType<Prisma.CommentFileUpdateManyWithoutCommentNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentFileCreateWithoutCommentInputSchema),z.lazy(() => CommentFileCreateWithoutCommentInputSchema).array(),z.lazy(() => CommentFileUncheckedCreateWithoutCommentInputSchema),z.lazy(() => CommentFileUncheckedCreateWithoutCommentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentFileCreateOrConnectWithoutCommentInputSchema),z.lazy(() => CommentFileCreateOrConnectWithoutCommentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CommentFileUpsertWithWhereUniqueWithoutCommentInputSchema),z.lazy(() => CommentFileUpsertWithWhereUniqueWithoutCommentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentFileCreateManyCommentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CommentFileWhereUniqueInputSchema),z.lazy(() => CommentFileWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CommentFileWhereUniqueInputSchema),z.lazy(() => CommentFileWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CommentFileWhereUniqueInputSchema),z.lazy(() => CommentFileWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CommentFileWhereUniqueInputSchema),z.lazy(() => CommentFileWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CommentFileUpdateWithWhereUniqueWithoutCommentInputSchema),z.lazy(() => CommentFileUpdateWithWhereUniqueWithoutCommentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CommentFileUpdateManyWithWhereWithoutCommentInputSchema),z.lazy(() => CommentFileUpdateManyWithWhereWithoutCommentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CommentFileScalarWhereInputSchema),z.lazy(() => CommentFileScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CommentFileUpdateManyWithoutCommentNestedInputSchema;
