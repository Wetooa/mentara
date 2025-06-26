import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptCreateWithoutMessageInputSchema } from './MessageReadReceiptCreateWithoutMessageInputSchema';
import { MessageReadReceiptUncheckedCreateWithoutMessageInputSchema } from './MessageReadReceiptUncheckedCreateWithoutMessageInputSchema';
import { MessageReadReceiptCreateOrConnectWithoutMessageInputSchema } from './MessageReadReceiptCreateOrConnectWithoutMessageInputSchema';
import { MessageReadReceiptUpsertWithWhereUniqueWithoutMessageInputSchema } from './MessageReadReceiptUpsertWithWhereUniqueWithoutMessageInputSchema';
import { MessageReadReceiptCreateManyMessageInputEnvelopeSchema } from './MessageReadReceiptCreateManyMessageInputEnvelopeSchema';
import { MessageReadReceiptWhereUniqueInputSchema } from './MessageReadReceiptWhereUniqueInputSchema';
import { MessageReadReceiptUpdateWithWhereUniqueWithoutMessageInputSchema } from './MessageReadReceiptUpdateWithWhereUniqueWithoutMessageInputSchema';
import { MessageReadReceiptUpdateManyWithWhereWithoutMessageInputSchema } from './MessageReadReceiptUpdateManyWithWhereWithoutMessageInputSchema';
import { MessageReadReceiptScalarWhereInputSchema } from './MessageReadReceiptScalarWhereInputSchema';

export const MessageReadReceiptUncheckedUpdateManyWithoutMessageNestedInputSchema: z.ZodType<Prisma.MessageReadReceiptUncheckedUpdateManyWithoutMessageNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessageReadReceiptCreateWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptCreateWithoutMessageInputSchema).array(),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutMessageInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageReadReceiptCreateOrConnectWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptCreateOrConnectWithoutMessageInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MessageReadReceiptUpsertWithWhereUniqueWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptUpsertWithWhereUniqueWithoutMessageInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageReadReceiptCreateManyMessageInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),z.lazy(() => MessageReadReceiptWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),z.lazy(() => MessageReadReceiptWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),z.lazy(() => MessageReadReceiptWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),z.lazy(() => MessageReadReceiptWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MessageReadReceiptUpdateWithWhereUniqueWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptUpdateWithWhereUniqueWithoutMessageInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MessageReadReceiptUpdateManyWithWhereWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptUpdateManyWithWhereWithoutMessageInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MessageReadReceiptScalarWhereInputSchema),z.lazy(() => MessageReadReceiptScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MessageReadReceiptUncheckedUpdateManyWithoutMessageNestedInputSchema;
