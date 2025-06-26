import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageUpdateWithoutReplyToInputSchema } from './MessageUpdateWithoutReplyToInputSchema';
import { MessageUncheckedUpdateWithoutReplyToInputSchema } from './MessageUncheckedUpdateWithoutReplyToInputSchema';

export const MessageUpdateWithWhereUniqueWithoutReplyToInputSchema: z.ZodType<Prisma.MessageUpdateWithWhereUniqueWithoutReplyToInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MessageUpdateWithoutReplyToInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutReplyToInputSchema) ]),
}).strict();

export default MessageUpdateWithWhereUniqueWithoutReplyToInputSchema;
