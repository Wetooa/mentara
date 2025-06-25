import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyHeartCreateWithoutUserInputSchema } from './ReplyHeartCreateWithoutUserInputSchema';
import { ReplyHeartUncheckedCreateWithoutUserInputSchema } from './ReplyHeartUncheckedCreateWithoutUserInputSchema';
import { ReplyHeartCreateOrConnectWithoutUserInputSchema } from './ReplyHeartCreateOrConnectWithoutUserInputSchema';
import { ReplyHeartUpsertWithWhereUniqueWithoutUserInputSchema } from './ReplyHeartUpsertWithWhereUniqueWithoutUserInputSchema';
import { ReplyHeartCreateManyUserInputEnvelopeSchema } from './ReplyHeartCreateManyUserInputEnvelopeSchema';
import { ReplyHeartWhereUniqueInputSchema } from './ReplyHeartWhereUniqueInputSchema';
import { ReplyHeartUpdateWithWhereUniqueWithoutUserInputSchema } from './ReplyHeartUpdateWithWhereUniqueWithoutUserInputSchema';
import { ReplyHeartUpdateManyWithWhereWithoutUserInputSchema } from './ReplyHeartUpdateManyWithWhereWithoutUserInputSchema';
import { ReplyHeartScalarWhereInputSchema } from './ReplyHeartScalarWhereInputSchema';

export const ReplyHeartUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ReplyHeartUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReplyHeartCreateWithoutUserInputSchema),z.lazy(() => ReplyHeartCreateWithoutUserInputSchema).array(),z.lazy(() => ReplyHeartUncheckedCreateWithoutUserInputSchema),z.lazy(() => ReplyHeartUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReplyHeartCreateOrConnectWithoutUserInputSchema),z.lazy(() => ReplyHeartCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReplyHeartUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ReplyHeartUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReplyHeartCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReplyHeartWhereUniqueInputSchema),z.lazy(() => ReplyHeartWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReplyHeartWhereUniqueInputSchema),z.lazy(() => ReplyHeartWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReplyHeartWhereUniqueInputSchema),z.lazy(() => ReplyHeartWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReplyHeartWhereUniqueInputSchema),z.lazy(() => ReplyHeartWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReplyHeartUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ReplyHeartUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReplyHeartUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ReplyHeartUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReplyHeartScalarWhereInputSchema),z.lazy(() => ReplyHeartScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReplyHeartUncheckedUpdateManyWithoutUserNestedInputSchema;
