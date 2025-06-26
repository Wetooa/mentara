import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyFileCreateWithoutReplyInputSchema } from './ReplyFileCreateWithoutReplyInputSchema';
import { ReplyFileUncheckedCreateWithoutReplyInputSchema } from './ReplyFileUncheckedCreateWithoutReplyInputSchema';
import { ReplyFileCreateOrConnectWithoutReplyInputSchema } from './ReplyFileCreateOrConnectWithoutReplyInputSchema';
import { ReplyFileUpsertWithWhereUniqueWithoutReplyInputSchema } from './ReplyFileUpsertWithWhereUniqueWithoutReplyInputSchema';
import { ReplyFileCreateManyReplyInputEnvelopeSchema } from './ReplyFileCreateManyReplyInputEnvelopeSchema';
import { ReplyFileWhereUniqueInputSchema } from './ReplyFileWhereUniqueInputSchema';
import { ReplyFileUpdateWithWhereUniqueWithoutReplyInputSchema } from './ReplyFileUpdateWithWhereUniqueWithoutReplyInputSchema';
import { ReplyFileUpdateManyWithWhereWithoutReplyInputSchema } from './ReplyFileUpdateManyWithWhereWithoutReplyInputSchema';
import { ReplyFileScalarWhereInputSchema } from './ReplyFileScalarWhereInputSchema';

export const ReplyFileUncheckedUpdateManyWithoutReplyNestedInputSchema: z.ZodType<Prisma.ReplyFileUncheckedUpdateManyWithoutReplyNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReplyFileCreateWithoutReplyInputSchema),z.lazy(() => ReplyFileCreateWithoutReplyInputSchema).array(),z.lazy(() => ReplyFileUncheckedCreateWithoutReplyInputSchema),z.lazy(() => ReplyFileUncheckedCreateWithoutReplyInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReplyFileCreateOrConnectWithoutReplyInputSchema),z.lazy(() => ReplyFileCreateOrConnectWithoutReplyInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReplyFileUpsertWithWhereUniqueWithoutReplyInputSchema),z.lazy(() => ReplyFileUpsertWithWhereUniqueWithoutReplyInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReplyFileCreateManyReplyInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReplyFileWhereUniqueInputSchema),z.lazy(() => ReplyFileWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReplyFileWhereUniqueInputSchema),z.lazy(() => ReplyFileWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReplyFileWhereUniqueInputSchema),z.lazy(() => ReplyFileWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReplyFileWhereUniqueInputSchema),z.lazy(() => ReplyFileWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReplyFileUpdateWithWhereUniqueWithoutReplyInputSchema),z.lazy(() => ReplyFileUpdateWithWhereUniqueWithoutReplyInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReplyFileUpdateManyWithWhereWithoutReplyInputSchema),z.lazy(() => ReplyFileUpdateManyWithWhereWithoutReplyInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReplyFileScalarWhereInputSchema),z.lazy(() => ReplyFileScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReplyFileUncheckedUpdateManyWithoutReplyNestedInputSchema;
