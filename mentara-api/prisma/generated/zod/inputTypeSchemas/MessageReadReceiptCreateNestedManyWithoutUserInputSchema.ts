import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptCreateWithoutUserInputSchema } from './MessageReadReceiptCreateWithoutUserInputSchema';
import { MessageReadReceiptUncheckedCreateWithoutUserInputSchema } from './MessageReadReceiptUncheckedCreateWithoutUserInputSchema';
import { MessageReadReceiptCreateOrConnectWithoutUserInputSchema } from './MessageReadReceiptCreateOrConnectWithoutUserInputSchema';
import { MessageReadReceiptCreateManyUserInputEnvelopeSchema } from './MessageReadReceiptCreateManyUserInputEnvelopeSchema';
import { MessageReadReceiptWhereUniqueInputSchema } from './MessageReadReceiptWhereUniqueInputSchema';

export const MessageReadReceiptCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.MessageReadReceiptCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => MessageReadReceiptCreateWithoutUserInputSchema),z.lazy(() => MessageReadReceiptCreateWithoutUserInputSchema).array(),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutUserInputSchema),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageReadReceiptCreateOrConnectWithoutUserInputSchema),z.lazy(() => MessageReadReceiptCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageReadReceiptCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),z.lazy(() => MessageReadReceiptWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MessageReadReceiptCreateNestedManyWithoutUserInputSchema;
