import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutConversationInputSchema } from './MessageCreateWithoutConversationInputSchema';
import { MessageUncheckedCreateWithoutConversationInputSchema } from './MessageUncheckedCreateWithoutConversationInputSchema';
import { MessageCreateOrConnectWithoutConversationInputSchema } from './MessageCreateOrConnectWithoutConversationInputSchema';
import { MessageUpsertWithWhereUniqueWithoutConversationInputSchema } from './MessageUpsertWithWhereUniqueWithoutConversationInputSchema';
import { MessageCreateManyConversationInputEnvelopeSchema } from './MessageCreateManyConversationInputEnvelopeSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageUpdateWithWhereUniqueWithoutConversationInputSchema } from './MessageUpdateWithWhereUniqueWithoutConversationInputSchema';
import { MessageUpdateManyWithWhereWithoutConversationInputSchema } from './MessageUpdateManyWithWhereWithoutConversationInputSchema';
import { MessageScalarWhereInputSchema } from './MessageScalarWhereInputSchema';

export const MessageUpdateManyWithoutConversationNestedInputSchema: z.ZodType<Prisma.MessageUpdateManyWithoutConversationNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutConversationInputSchema),z.lazy(() => MessageCreateWithoutConversationInputSchema).array(),z.lazy(() => MessageUncheckedCreateWithoutConversationInputSchema),z.lazy(() => MessageUncheckedCreateWithoutConversationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessageCreateOrConnectWithoutConversationInputSchema),z.lazy(() => MessageCreateOrConnectWithoutConversationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MessageUpsertWithWhereUniqueWithoutConversationInputSchema),z.lazy(() => MessageUpsertWithWhereUniqueWithoutConversationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessageCreateManyConversationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MessageWhereUniqueInputSchema),z.lazy(() => MessageWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MessageUpdateWithWhereUniqueWithoutConversationInputSchema),z.lazy(() => MessageUpdateWithWhereUniqueWithoutConversationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MessageUpdateManyWithWhereWithoutConversationInputSchema),z.lazy(() => MessageUpdateManyWithWhereWithoutConversationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MessageScalarWhereInputSchema),z.lazy(() => MessageScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MessageUpdateManyWithoutConversationNestedInputSchema;
