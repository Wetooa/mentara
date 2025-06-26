import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageUpdateWithoutSenderInputSchema } from './MessageUpdateWithoutSenderInputSchema';
import { MessageUncheckedUpdateWithoutSenderInputSchema } from './MessageUncheckedUpdateWithoutSenderInputSchema';

export const MessageUpdateWithWhereUniqueWithoutSenderInputSchema: z.ZodType<Prisma.MessageUpdateWithWhereUniqueWithoutSenderInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MessageUpdateWithoutSenderInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutSenderInputSchema) ]),
}).strict();

export default MessageUpdateWithWhereUniqueWithoutSenderInputSchema;
