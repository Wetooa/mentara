import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutReplyToInputSchema } from './MessageCreateWithoutReplyToInputSchema';
import { MessageUncheckedCreateWithoutReplyToInputSchema } from './MessageUncheckedCreateWithoutReplyToInputSchema';
import { MessageCreateOrConnectWithoutReplyToInputSchema } from './MessageCreateOrConnectWithoutReplyToInputSchema';
import { MessageCreateManyReplyToInputEnvelopeSchema } from './MessageCreateManyReplyToInputEnvelopeSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';

export const MessageCreateNestedManyWithoutReplyToInputSchema: z.ZodType<Prisma.MessageCreateNestedManyWithoutReplyToInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutReplyToInputSchema),z.lazy(() => MessageCreateWithoutReplyToInputSchema).array(),z.lazy(() => MessageUncheckedCreateWithoutReplyToInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReplyToInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageCreateOrConnectWithoutReplyToInputSchema),z.lazy(() => MessageCreateOrConnectWithoutReplyToInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageCreateManyReplyToInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MessageCreateNestedManyWithoutReplyToInputSchema;
