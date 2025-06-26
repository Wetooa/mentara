import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageReactionScalarWhereInputSchema } from './MessageReactionScalarWhereInputSchema';
import { MessageReactionUpdateManyMutationInputSchema } from './MessageReactionUpdateManyMutationInputSchema';
import { MessageReactionUncheckedUpdateManyWithoutUserInputSchema } from './MessageReactionUncheckedUpdateManyWithoutUserInputSchema';

export const MessageReactionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.MessageReactionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => MessageReactionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MessageReactionUpdateManyMutationInputSchema),z.lazy(() => MessageReactionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default MessageReactionUpdateManyWithWhereWithoutUserInputSchema;
