import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutReplyToInputSchema } from './MessageCreateWithoutReplyToInputSchema';
import { MessageUncheckedCreateWithoutReplyToInputSchema } from './MessageUncheckedCreateWithoutReplyToInputSchema';
import { MessageCreateOrConnectWithoutReplyToInputSchema } from './MessageCreateOrConnectWithoutReplyToInputSchema';
import { MessageUpsertWithWhereUniqueWithoutReplyToInputSchema } from './MessageUpsertWithWhereUniqueWithoutReplyToInputSchema';
import { MessageCreateManyReplyToInputEnvelopeSchema } from './MessageCreateManyReplyToInputEnvelopeSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageUpdateWithWhereUniqueWithoutReplyToInputSchema } from './MessageUpdateWithWhereUniqueWithoutReplyToInputSchema';
import { MessageUpdateManyWithWhereWithoutReplyToInputSchema } from './MessageUpdateManyWithWhereWithoutReplyToInputSchema';
import { MessageScalarWhereInputSchema } from './MessageScalarWhereInputSchema';

export const MessageUpdateManyWithoutReplyToNestedInputSchema: z.ZodType<Prisma.MessageUpdateManyWithoutReplyToNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutReplyToInputSchema),z.lazy(() => MessageCreateWithoutReplyToInputSchema).array(),z.lazy(() => MessageUncheckedCreateWithoutReplyToInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReplyToInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageCreateOrConnectWithoutReplyToInputSchema),z.lazy(() => MessageCreateOrConnectWithoutReplyToInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MessageUpsertWithWhereUniqueWithoutReplyToInputSchema),z.lazy(() => MessageUpsertWithWhereUniqueWithoutReplyToInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageCreateManyReplyToInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MessageUpdateWithWhereUniqueWithoutReplyToInputSchema),z.lazy(() => MessageUpdateWithWhereUniqueWithoutReplyToInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MessageUpdateManyWithWhereWithoutReplyToInputSchema),z.lazy(() => MessageUpdateManyWithWhereWithoutReplyToInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MessageScalarWhereInputSchema),z.lazy(() => MessageScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MessageUpdateManyWithoutReplyToNestedInputSchema;
