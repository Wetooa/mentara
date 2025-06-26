import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartCreateWithoutReplyInputSchema } from './ReplyHeartCreateWithoutReplyInputSchema';
import { ReplyHeartUncheckedCreateWithoutReplyInputSchema } from './ReplyHeartUncheckedCreateWithoutReplyInputSchema';
import { ReplyHeartCreateOrConnectWithoutReplyInputSchema } from './ReplyHeartCreateOrConnectWithoutReplyInputSchema';
import { ReplyHeartUpsertWithWhereUniqueWithoutReplyInputSchema } from './ReplyHeartUpsertWithWhereUniqueWithoutReplyInputSchema';
import { ReplyHeartCreateManyReplyInputEnvelopeSchema } from './ReplyHeartCreateManyReplyInputEnvelopeSchema';
import { ReplyHeartWhereUniqueInputSchema } from './ReplyHeartWhereUniqueInputSchema';
import { ReplyHeartUpdateWithWhereUniqueWithoutReplyInputSchema } from './ReplyHeartUpdateWithWhereUniqueWithoutReplyInputSchema';
import { ReplyHeartUpdateManyWithWhereWithoutReplyInputSchema } from './ReplyHeartUpdateManyWithWhereWithoutReplyInputSchema';
import { ReplyHeartScalarWhereInputSchema } from './ReplyHeartScalarWhereInputSchema';

export const ReplyHeartUncheckedUpdateManyWithoutReplyNestedInputSchema: z.ZodType<Prisma.ReplyHeartUncheckedUpdateManyWithoutReplyNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReplyHeartCreateWithoutReplyInputSchema),z.lazy(() => ReplyHeartCreateWithoutReplyInputSchema).array(),z.lazy(() => ReplyHeartUncheckedCreateWithoutReplyInputSchema),z.lazy(() => ReplyHeartUncheckedCreateWithoutReplyInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReplyHeartCreateOrConnectWithoutReplyInputSchema),z.lazy(() => ReplyHeartCreateOrConnectWithoutReplyInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReplyHeartUpsertWithWhereUniqueWithoutReplyInputSchema),z.lazy(() => ReplyHeartUpsertWithWhereUniqueWithoutReplyInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReplyHeartCreateManyReplyInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReplyHeartWhereUniqueInputSchema),z.lazy(() => ReplyHeartWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReplyHeartWhereUniqueInputSchema),z.lazy(() => ReplyHeartWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReplyHeartWhereUniqueInputSchema),z.lazy(() => ReplyHeartWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReplyHeartWhereUniqueInputSchema),z.lazy(() => ReplyHeartWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReplyHeartUpdateWithWhereUniqueWithoutReplyInputSchema),z.lazy(() => ReplyHeartUpdateWithWhereUniqueWithoutReplyInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReplyHeartUpdateManyWithWhereWithoutReplyInputSchema),z.lazy(() => ReplyHeartUpdateManyWithWhereWithoutReplyInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReplyHeartScalarWhereInputSchema),z.lazy(() => ReplyHeartScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReplyHeartUncheckedUpdateManyWithoutReplyNestedInputSchema;
