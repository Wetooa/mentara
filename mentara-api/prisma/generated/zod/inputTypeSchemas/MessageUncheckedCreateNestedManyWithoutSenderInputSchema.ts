import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutSenderInputSchema } from './MessageCreateWithoutSenderInputSchema';
import { MessageUncheckedCreateWithoutSenderInputSchema } from './MessageUncheckedCreateWithoutSenderInputSchema';
import { MessageCreateOrConnectWithoutSenderInputSchema } from './MessageCreateOrConnectWithoutSenderInputSchema';
import { MessageCreateManySenderInputEnvelopeSchema } from './MessageCreateManySenderInputEnvelopeSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';

export const MessageUncheckedCreateNestedManyWithoutSenderInputSchema: z.ZodType<Prisma.MessageUncheckedCreateNestedManyWithoutSenderInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutSenderInputSchema),z.lazy(() => MessageCreateWithoutSenderInputSchema).array(),z.lazy(() => MessageUncheckedCreateWithoutSenderInputSchema),z.lazy(() => MessageUncheckedCreateWithoutSenderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageCreateOrConnectWithoutSenderInputSchema),z.lazy(() => MessageCreateOrConnectWithoutSenderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageCreateManySenderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MessageUncheckedCreateNestedManyWithoutSenderInputSchema;
