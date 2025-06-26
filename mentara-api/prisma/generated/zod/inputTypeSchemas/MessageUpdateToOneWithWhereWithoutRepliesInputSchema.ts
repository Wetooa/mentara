import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';
import { MessageUpdateWithoutRepliesInputSchema } from './MessageUpdateWithoutRepliesInputSchema';
import { MessageUncheckedUpdateWithoutRepliesInputSchema } from './MessageUncheckedUpdateWithoutRepliesInputSchema';

export const MessageUpdateToOneWithWhereWithoutRepliesInputSchema: z.ZodType<Prisma.MessageUpdateToOneWithWhereWithoutRepliesInput> = z.object({
  where: z.lazy(() => MessageWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => MessageUpdateWithoutRepliesInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutRepliesInputSchema) ]),
}).strict();

export default MessageUpdateToOneWithWhereWithoutRepliesInputSchema;
