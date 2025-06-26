import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationWhereUniqueInputSchema } from './ConversationWhereUniqueInputSchema';
import { ConversationCreateWithoutMessagesInputSchema } from './ConversationCreateWithoutMessagesInputSchema';
import { ConversationUncheckedCreateWithoutMessagesInputSchema } from './ConversationUncheckedCreateWithoutMessagesInputSchema';

export const ConversationCreateOrConnectWithoutMessagesInputSchema: z.ZodType<Prisma.ConversationCreateOrConnectWithoutMessagesInput> = z.object({
  where: z.lazy(() => ConversationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ConversationCreateWithoutMessagesInputSchema),z.lazy(() => ConversationUncheckedCreateWithoutMessagesInputSchema) ]),
}).strict();

export default ConversationCreateOrConnectWithoutMessagesInputSchema;
