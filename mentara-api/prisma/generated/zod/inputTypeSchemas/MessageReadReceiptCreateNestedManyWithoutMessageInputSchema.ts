import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReadReceiptCreateWithoutMessageInputSchema } from './MessageReadReceiptCreateWithoutMessageInputSchema';
import { MessageReadReceiptUncheckedCreateWithoutMessageInputSchema } from './MessageReadReceiptUncheckedCreateWithoutMessageInputSchema';
import { MessageReadReceiptCreateOrConnectWithoutMessageInputSchema } from './MessageReadReceiptCreateOrConnectWithoutMessageInputSchema';
import { MessageReadReceiptCreateManyMessageInputEnvelopeSchema } from './MessageReadReceiptCreateManyMessageInputEnvelopeSchema';
import { MessageReadReceiptWhereUniqueInputSchema } from './MessageReadReceiptWhereUniqueInputSchema';

export const MessageReadReceiptCreateNestedManyWithoutMessageInputSchema: z.ZodType<Prisma.MessageReadReceiptCreateNestedManyWithoutMessageInput> = z.object({
  create: z.union([ z.lazy(() => MessageReadReceiptCreateWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptCreateWithoutMessageInputSchema).array(),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptUncheckedCreateWithoutMessageInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageReadReceiptCreateOrConnectWithoutMessageInputSchema),z.lazy(() => MessageReadReceiptCreateOrConnectWithoutMessageInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageReadReceiptCreateManyMessageInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessageReadReceiptWhereUniqueInputSchema),z.lazy(() => MessageReadReceiptWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MessageReadReceiptCreateNestedManyWithoutMessageInputSchema;
