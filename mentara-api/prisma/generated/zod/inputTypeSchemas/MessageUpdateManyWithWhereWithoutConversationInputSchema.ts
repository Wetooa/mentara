import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageScalarWhereInputSchema } from './MessageScalarWhereInputSchema';
import { MessageUpdateManyMutationInputSchema } from './MessageUpdateManyMutationInputSchema';
import { MessageUncheckedUpdateManyWithoutConversationInputSchema } from './MessageUncheckedUpdateManyWithoutConversationInputSchema';

export const MessageUpdateManyWithWhereWithoutConversationInputSchema: z.ZodType<Prisma.MessageUpdateManyWithWhereWithoutConversationInput> = z.object({
  where: z.lazy(() => MessageScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MessageUpdateManyMutationInputSchema),z.lazy(() => MessageUncheckedUpdateManyWithoutConversationInputSchema) ]),
}).strict();

export default MessageUpdateManyWithWhereWithoutConversationInputSchema;
