import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionScalarWhereInputSchema } from './MessageReactionScalarWhereInputSchema';
import { MessageReactionUpdateManyMutationInputSchema } from './MessageReactionUpdateManyMutationInputSchema';
import { MessageReactionUncheckedUpdateManyWithoutMessageInputSchema } from './MessageReactionUncheckedUpdateManyWithoutMessageInputSchema';

export const MessageReactionUpdateManyWithWhereWithoutMessageInputSchema: z.ZodType<Prisma.MessageReactionUpdateManyWithWhereWithoutMessageInput> = z.object({
  where: z.lazy(() => MessageReactionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MessageReactionUpdateManyMutationInputSchema),z.lazy(() => MessageReactionUncheckedUpdateManyWithoutMessageInputSchema) ]),
}).strict();

export default MessageReactionUpdateManyWithWhereWithoutMessageInputSchema;
