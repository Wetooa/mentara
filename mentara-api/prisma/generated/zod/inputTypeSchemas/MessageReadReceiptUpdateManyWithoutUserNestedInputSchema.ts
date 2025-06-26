import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptCreateWithoutUserInputSchema } from './MessageReadReceiptCreateWithoutUserInputSchema';
import { MessageReadReceiptUncheckedCreateWithoutUserInputSchema } from './MessageReadReceiptUncheckedCreateWithoutUserInputSchema';
import { MessageReadReceiptCreateOrConnectWithoutUserInputSchema } from './MessageReadReceiptCreateOrConnectWithoutUserInputSchema';
import { MessageReadReceiptUpsertWithWhereUniqueWithoutUserInputSchema } from './MessageReadReceiptUpsertWithWhereUniqueWithoutUserInputSchema';
import { MessageReadReceiptCreateManyUserInputEnvelopeSchema } from './MessageReadReceiptCreateManyUserInputEnvelopeSchema';
import { MessageReadReceiptWhereUniqueInputSchema } from './MessageReadReceiptWhereUniqueInputSchema';
import { MessageReadReceiptUpdateWithWhereUniqueWithoutUserInputSchema } from './MessageReadReceiptUpdateWithWhereUniqueWithoutUserInputSchema';
import { MessageReadReceiptUpdateManyWithWhereWithoutUserInputSchema } from './MessageReadReceiptUpdateManyWithWhereWithoutUserInputSchema';
import { MessageReadReceiptScalarWhereInputSchema } from './MessageReadReceiptScalarWhereInputSchema';

export const MessageReadReceiptUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.MessageReadReceiptUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessageReadReceiptCreateWithoutUserInputSchema),z.lazy(() => MessageReadReceiptCreateWithoutUserInputSchema).array(),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutUserInputSchema),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageReadReceiptCreateOrConnectWithoutUserInputSchema),z.lazy(() => MessageReadReceiptCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MessageReadReceiptUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => MessageReadReceiptUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageReadReceiptCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),z.lazy(() => MessageReadReceiptWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),z.lazy(() => MessageReadReceiptWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),z.lazy(() => MessageReadReceiptWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),z.lazy(() => MessageReadReceiptWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MessageReadReceiptUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => MessageReadReceiptUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MessageReadReceiptUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => MessageReadReceiptUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MessageReadReceiptScalarWhereInputSchema),z.lazy(() => MessageReadReceiptScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MessageReadReceiptUpdateManyWithoutUserNestedInputSchema;
