import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateWithoutUserInputSchema } from './ReplyCreateWithoutUserInputSchema';
import { ReplyUncheckedCreateWithoutUserInputSchema } from './ReplyUncheckedCreateWithoutUserInputSchema';
import { ReplyCreateOrConnectWithoutUserInputSchema } from './ReplyCreateOrConnectWithoutUserInputSchema';
import { ReplyUpsertWithWhereUniqueWithoutUserInputSchema } from './ReplyUpsertWithWhereUniqueWithoutUserInputSchema';
import { ReplyCreateManyUserInputEnvelopeSchema } from './ReplyCreateManyUserInputEnvelopeSchema';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyUpdateWithWhereUniqueWithoutUserInputSchema } from './ReplyUpdateWithWhereUniqueWithoutUserInputSchema';
import { ReplyUpdateManyWithWhereWithoutUserInputSchema } from './ReplyUpdateManyWithWhereWithoutUserInputSchema';
import { ReplyScalarWhereInputSchema } from './ReplyScalarWhereInputSchema';

export const ReplyUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ReplyUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReplyCreateWithoutUserInputSchema),z.lazy(() => ReplyCreateWithoutUserInputSchema).array(),z.lazy(() => ReplyUncheckedCreateWithoutUserInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReplyCreateOrConnectWithoutUserInputSchema),z.lazy(() => ReplyCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReplyUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ReplyUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReplyCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReplyWhereUniqueInputSchema),z.lazy(() => ReplyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReplyWhereUniqueInputSchema),z.lazy(() => ReplyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReplyWhereUniqueInputSchema),z.lazy(() => ReplyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReplyWhereUniqueInputSchema),z.lazy(() => ReplyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReplyUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ReplyUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReplyUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ReplyUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReplyScalarWhereInputSchema),z.lazy(() => ReplyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReplyUncheckedUpdateManyWithoutUserNestedInputSchema;
