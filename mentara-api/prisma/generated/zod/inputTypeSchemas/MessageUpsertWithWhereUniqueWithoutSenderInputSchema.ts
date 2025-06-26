import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageUpdateWithoutSenderInputSchema } from './MessageUpdateWithoutSenderInputSchema';
import { MessageUncheckedUpdateWithoutSenderInputSchema } from './MessageUncheckedUpdateWithoutSenderInputSchema';
import { MessageCreateWithoutSenderInputSchema } from './MessageCreateWithoutSenderInputSchema';
import { MessageUncheckedCreateWithoutSenderInputSchema } from './MessageUncheckedCreateWithoutSenderInputSchema';

export const MessageUpsertWithWhereUniqueWithoutSenderInputSchema: z.ZodType<Prisma.MessageUpsertWithWhereUniqueWithoutSenderInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MessageUpdateWithoutSenderInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutSenderInputSchema) ]),
  create: z.union([ z.lazy(() => MessageCreateWithoutSenderInputSchema),z.lazy(() => MessageUncheckedCreateWithoutSenderInputSchema) ]),
}).strict();

export default MessageUpsertWithWhereUniqueWithoutSenderInputSchema;
