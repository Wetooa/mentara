import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateWithoutCommentInputSchema } from './ReplyCreateWithoutCommentInputSchema';
import { ReplyUncheckedCreateWithoutCommentInputSchema } from './ReplyUncheckedCreateWithoutCommentInputSchema';
import { ReplyCreateOrConnectWithoutCommentInputSchema } from './ReplyCreateOrConnectWithoutCommentInputSchema';
import { ReplyUpsertWithWhereUniqueWithoutCommentInputSchema } from './ReplyUpsertWithWhereUniqueWithoutCommentInputSchema';
import { ReplyCreateManyCommentInputEnvelopeSchema } from './ReplyCreateManyCommentInputEnvelopeSchema';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyUpdateWithWhereUniqueWithoutCommentInputSchema } from './ReplyUpdateWithWhereUniqueWithoutCommentInputSchema';
import { ReplyUpdateManyWithWhereWithoutCommentInputSchema } from './ReplyUpdateManyWithWhereWithoutCommentInputSchema';
import { ReplyScalarWhereInputSchema } from './ReplyScalarWhereInputSchema';

export const ReplyUpdateManyWithoutCommentNestedInputSchema: z.ZodType<Prisma.ReplyUpdateManyWithoutCommentNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReplyCreateWithoutCommentInputSchema),z.lazy(() => ReplyCreateWithoutCommentInputSchema).array(),z.lazy(() => ReplyUncheckedCreateWithoutCommentInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutCommentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReplyCreateOrConnectWithoutCommentInputSchema),z.lazy(() => ReplyCreateOrConnectWithoutCommentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReplyUpsertWithWhereUniqueWithoutCommentInputSchema),z.lazy(() => ReplyUpsertWithWhereUniqueWithoutCommentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReplyCreateManyCommentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReplyWhereUniqueInputSchema),z.lazy(() => ReplyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReplyWhereUniqueInputSchema),z.lazy(() => ReplyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReplyWhereUniqueInputSchema),z.lazy(() => ReplyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReplyWhereUniqueInputSchema),z.lazy(() => ReplyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReplyUpdateWithWhereUniqueWithoutCommentInputSchema),z.lazy(() => ReplyUpdateWithWhereUniqueWithoutCommentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReplyUpdateManyWithWhereWithoutCommentInputSchema),z.lazy(() => ReplyUpdateManyWithWhereWithoutCommentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReplyScalarWhereInputSchema),z.lazy(() => ReplyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReplyUpdateManyWithoutCommentNestedInputSchema;
