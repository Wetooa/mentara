import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionCreateWithoutUserInputSchema } from './MessageReactionCreateWithoutUserInputSchema';
import { MessageReactionUncheckedCreateWithoutUserInputSchema } from './MessageReactionUncheckedCreateWithoutUserInputSchema';
import { MessageReactionCreateOrConnectWithoutUserInputSchema } from './MessageReactionCreateOrConnectWithoutUserInputSchema';
import { MessageReactionUpsertWithWhereUniqueWithoutUserInputSchema } from './MessageReactionUpsertWithWhereUniqueWithoutUserInputSchema';
import { MessageReactionCreateManyUserInputEnvelopeSchema } from './MessageReactionCreateManyUserInputEnvelopeSchema';
import { MessageReactionWhereUniqueInputSchema } from './MessageReactionWhereUniqueInputSchema';
import { MessageReactionUpdateWithWhereUniqueWithoutUserInputSchema } from './MessageReactionUpdateWithWhereUniqueWithoutUserInputSchema';
import { MessageReactionUpdateManyWithWhereWithoutUserInputSchema } from './MessageReactionUpdateManyWithWhereWithoutUserInputSchema';
import { MessageReactionScalarWhereInputSchema } from './MessageReactionScalarWhereInputSchema';

export const MessageReactionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.MessageReactionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessageReactionCreateWithoutUserInputSchema),z.lazy(() => MessageReactionCreateWithoutUserInputSchema).array(),z.lazy(() => MessageReactionUncheckedCreateWithoutUserInputSchema),z.lazy(() => MessageReactionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageReactionCreateOrConnectWithoutUserInputSchema),z.lazy(() => MessageReactionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MessageReactionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => MessageReactionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageReactionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MessageReactionWhereUniqueInputSchema),z.lazy(() => MessageReactionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MessageReactionWhereUniqueInputSchema),z.lazy(() => MessageReactionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MessageReactionWhereUniqueInputSchema),z.lazy(() => MessageReactionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MessageReactionWhereUniqueInputSchema),z.lazy(() => MessageReactionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MessageReactionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => MessageReactionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MessageReactionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => MessageReactionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MessageReactionScalarWhereInputSchema),z.lazy(() => MessageReactionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MessageReactionUncheckedUpdateManyWithoutUserNestedInputSchema;
