import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionCreateWithoutMessageInputSchema } from './MessageReactionCreateWithoutMessageInputSchema';
import { MessageReactionUncheckedCreateWithoutMessageInputSchema } from './MessageReactionUncheckedCreateWithoutMessageInputSchema';
import { MessageReactionCreateOrConnectWithoutMessageInputSchema } from './MessageReactionCreateOrConnectWithoutMessageInputSchema';
import { MessageReactionUpsertWithWhereUniqueWithoutMessageInputSchema } from './MessageReactionUpsertWithWhereUniqueWithoutMessageInputSchema';
import { MessageReactionCreateManyMessageInputEnvelopeSchema } from './MessageReactionCreateManyMessageInputEnvelopeSchema';
import { MessageReactionWhereUniqueInputSchema } from './MessageReactionWhereUniqueInputSchema';
import { MessageReactionUpdateWithWhereUniqueWithoutMessageInputSchema } from './MessageReactionUpdateWithWhereUniqueWithoutMessageInputSchema';
import { MessageReactionUpdateManyWithWhereWithoutMessageInputSchema } from './MessageReactionUpdateManyWithWhereWithoutMessageInputSchema';
import { MessageReactionScalarWhereInputSchema } from './MessageReactionScalarWhereInputSchema';

export const MessageReactionUncheckedUpdateManyWithoutMessageNestedInputSchema: z.ZodType<Prisma.MessageReactionUncheckedUpdateManyWithoutMessageNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessageReactionCreateWithoutMessageInputSchema),z.lazy(() => MessageReactionCreateWithoutMessageInputSchema).array(),z.lazy(() => MessageReactionUncheckedCreateWithoutMessageInputSchema),z.lazy(() => MessageReactionUncheckedCreateWithoutMessageInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageReactionCreateOrConnectWithoutMessageInputSchema),z.lazy(() => MessageReactionCreateOrConnectWithoutMessageInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MessageReactionUpsertWithWhereUniqueWithoutMessageInputSchema),z.lazy(() => MessageReactionUpsertWithWhereUniqueWithoutMessageInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageReactionCreateManyMessageInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MessageReactionWhereUniqueInputSchema),z.lazy(() => MessageReactionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MessageReactionWhereUniqueInputSchema),z.lazy(() => MessageReactionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MessageReactionWhereUniqueInputSchema),z.lazy(() => MessageReactionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MessageReactionWhereUniqueInputSchema),z.lazy(() => MessageReactionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MessageReactionUpdateWithWhereUniqueWithoutMessageInputSchema),z.lazy(() => MessageReactionUpdateWithWhereUniqueWithoutMessageInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MessageReactionUpdateManyWithWhereWithoutMessageInputSchema),z.lazy(() => MessageReactionUpdateManyWithWhereWithoutMessageInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MessageReactionScalarWhereInputSchema),z.lazy(() => MessageReactionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MessageReactionUncheckedUpdateManyWithoutMessageNestedInputSchema;
