import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageScalarWhereInputSchema } from './MessageScalarWhereInputSchema';
import { MessageUpdateManyMutationInputSchema } from './MessageUpdateManyMutationInputSchema';
import { MessageUncheckedUpdateManyWithoutReplyToInputSchema } from './MessageUncheckedUpdateManyWithoutReplyToInputSchema';

export const MessageUpdateManyWithWhereWithoutReplyToInputSchema: z.ZodType<Prisma.MessageUpdateManyWithWhereWithoutReplyToInput> = z.object({
  where: z.lazy(() => MessageScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MessageUpdateManyMutationInputSchema),z.lazy(() => MessageUncheckedUpdateManyWithoutReplyToInputSchema) ]),
}).strict();

export default MessageUpdateManyWithWhereWithoutReplyToInputSchema;
