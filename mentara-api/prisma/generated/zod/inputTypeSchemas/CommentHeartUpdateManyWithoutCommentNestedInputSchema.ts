import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartCreateWithoutCommentInputSchema } from './CommentHeartCreateWithoutCommentInputSchema';
import { CommentHeartUncheckedCreateWithoutCommentInputSchema } from './CommentHeartUncheckedCreateWithoutCommentInputSchema';
import { CommentHeartCreateOrConnectWithoutCommentInputSchema } from './CommentHeartCreateOrConnectWithoutCommentInputSchema';
import { CommentHeartUpsertWithWhereUniqueWithoutCommentInputSchema } from './CommentHeartUpsertWithWhereUniqueWithoutCommentInputSchema';
import { CommentHeartCreateManyCommentInputEnvelopeSchema } from './CommentHeartCreateManyCommentInputEnvelopeSchema';
import { CommentHeartWhereUniqueInputSchema } from './CommentHeartWhereUniqueInputSchema';
import { CommentHeartUpdateWithWhereUniqueWithoutCommentInputSchema } from './CommentHeartUpdateWithWhereUniqueWithoutCommentInputSchema';
import { CommentHeartUpdateManyWithWhereWithoutCommentInputSchema } from './CommentHeartUpdateManyWithWhereWithoutCommentInputSchema';
import { CommentHeartScalarWhereInputSchema } from './CommentHeartScalarWhereInputSchema';

export const CommentHeartUpdateManyWithoutCommentNestedInputSchema: z.ZodType<Prisma.CommentHeartUpdateManyWithoutCommentNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentHeartCreateWithoutCommentInputSchema),z.lazy(() => CommentHeartCreateWithoutCommentInputSchema).array(),z.lazy(() => CommentHeartUncheckedCreateWithoutCommentInputSchema),z.lazy(() => CommentHeartUncheckedCreateWithoutCommentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentHeartCreateOrConnectWithoutCommentInputSchema),z.lazy(() => CommentHeartCreateOrConnectWithoutCommentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CommentHeartUpsertWithWhereUniqueWithoutCommentInputSchema),z.lazy(() => CommentHeartUpsertWithWhereUniqueWithoutCommentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentHeartCreateManyCommentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CommentHeartWhereUniqueInputSchema),z.lazy(() => CommentHeartWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CommentHeartWhereUniqueInputSchema),z.lazy(() => CommentHeartWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CommentHeartWhereUniqueInputSchema),z.lazy(() => CommentHeartWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CommentHeartWhereUniqueInputSchema),z.lazy(() => CommentHeartWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CommentHeartUpdateWithWhereUniqueWithoutCommentInputSchema),z.lazy(() => CommentHeartUpdateWithWhereUniqueWithoutCommentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CommentHeartUpdateManyWithWhereWithoutCommentInputSchema),z.lazy(() => CommentHeartUpdateManyWithWhereWithoutCommentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CommentHeartScalarWhereInputSchema),z.lazy(() => CommentHeartScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CommentHeartUpdateManyWithoutCommentNestedInputSchema;
