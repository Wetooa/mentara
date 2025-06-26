import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionCreateWithoutUserInputSchema } from './MessageReactionCreateWithoutUserInputSchema';
import { MessageReactionUncheckedCreateWithoutUserInputSchema } from './MessageReactionUncheckedCreateWithoutUserInputSchema';
import { MessageReactionCreateOrConnectWithoutUserInputSchema } from './MessageReactionCreateOrConnectWithoutUserInputSchema';
import { MessageReactionCreateManyUserInputEnvelopeSchema } from './MessageReactionCreateManyUserInputEnvelopeSchema';
import { MessageReactionWhereUniqueInputSchema } from './MessageReactionWhereUniqueInputSchema';

export const MessageReactionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.MessageReactionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => MessageReactionCreateWithoutUserInputSchema),z.lazy(() => MessageReactionCreateWithoutUserInputSchema).array(),z.lazy(() => MessageReactionUncheckedCreateWithoutUserInputSchema),z.lazy(() => MessageReactionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageReactionCreateOrConnectWithoutUserInputSchema),z.lazy(() => MessageReactionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageReactionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessageReactionWhereUniqueInputSchema),z.lazy(() => MessageReactionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MessageReactionUncheckedCreateNestedManyWithoutUserInputSchema;
