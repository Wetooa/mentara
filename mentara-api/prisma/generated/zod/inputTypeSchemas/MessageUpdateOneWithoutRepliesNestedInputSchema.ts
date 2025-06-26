import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutRepliesInputSchema } from './MessageCreateWithoutRepliesInputSchema';
import { MessageUncheckedCreateWithoutRepliesInputSchema } from './MessageUncheckedCreateWithoutRepliesInputSchema';
import { MessageCreateOrConnectWithoutRepliesInputSchema } from './MessageCreateOrConnectWithoutRepliesInputSchema';
import { MessageUpsertWithoutRepliesInputSchema } from './MessageUpsertWithoutRepliesInputSchema';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageUpdateToOneWithWhereWithoutRepliesInputSchema } from './MessageUpdateToOneWithWhereWithoutRepliesInputSchema';
import { MessageUpdateWithoutRepliesInputSchema } from './MessageUpdateWithoutRepliesInputSchema';
import { MessageUncheckedUpdateWithoutRepliesInputSchema } from './MessageUncheckedUpdateWithoutRepliesInputSchema';

export const MessageUpdateOneWithoutRepliesNestedInputSchema: z.ZodType<Prisma.MessageUpdateOneWithoutRepliesNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutRepliesInputSchema),z.lazy(() => MessageUncheckedCreateWithoutRepliesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MessageCreateOrConnectWithoutRepliesInputSchema).optional(),
  upsert: z.lazy(() => MessageUpsertWithoutRepliesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => MessageWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => MessageWhereInputSchema) ]).optional(),
  connect: z.lazy(() => MessageWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => MessageUpdateToOneWithWhereWithoutRepliesInputSchema),z.lazy(() => MessageUpdateWithoutRepliesInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutRepliesInputSchema) ]).optional(),
}).strict();

export default MessageUpdateOneWithoutRepliesNestedInputSchema;
