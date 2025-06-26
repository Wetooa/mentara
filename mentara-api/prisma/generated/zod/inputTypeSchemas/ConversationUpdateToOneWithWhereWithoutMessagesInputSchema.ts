import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationWhereInputSchema } from './ConversationWhereInputSchema';
import { ConversationUpdateWithoutMessagesInputSchema } from './ConversationUpdateWithoutMessagesInputSchema';
import { ConversationUncheckedUpdateWithoutMessagesInputSchema } from './ConversationUncheckedUpdateWithoutMessagesInputSchema';

export const ConversationUpdateToOneWithWhereWithoutMessagesInputSchema: z.ZodType<Prisma.ConversationUpdateToOneWithWhereWithoutMessagesInput> = z.object({
  where: z.lazy(() => ConversationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ConversationUpdateWithoutMessagesInputSchema),z.lazy(() => ConversationUncheckedUpdateWithoutMessagesInputSchema) ]),
}).strict();

export default ConversationUpdateToOneWithWhereWithoutMessagesInputSchema;
