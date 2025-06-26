import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationUpdateWithoutMessagesInputSchema } from './ConversationUpdateWithoutMessagesInputSchema';
import { ConversationUncheckedUpdateWithoutMessagesInputSchema } from './ConversationUncheckedUpdateWithoutMessagesInputSchema';
import { ConversationCreateWithoutMessagesInputSchema } from './ConversationCreateWithoutMessagesInputSchema';
import { ConversationUncheckedCreateWithoutMessagesInputSchema } from './ConversationUncheckedCreateWithoutMessagesInputSchema';
import { ConversationWhereInputSchema } from './ConversationWhereInputSchema';

export const ConversationUpsertWithoutMessagesInputSchema: z.ZodType<Prisma.ConversationUpsertWithoutMessagesInput> = z.object({
  update: z.union([ z.lazy(() => ConversationUpdateWithoutMessagesInputSchema),z.lazy(() => ConversationUncheckedUpdateWithoutMessagesInputSchema) ]),
  create: z.union([ z.lazy(() => ConversationCreateWithoutMessagesInputSchema),z.lazy(() => ConversationUncheckedCreateWithoutMessagesInputSchema) ]),
  where: z.lazy(() => ConversationWhereInputSchema).optional()
}).strict();

export default ConversationUpsertWithoutMessagesInputSchema;
