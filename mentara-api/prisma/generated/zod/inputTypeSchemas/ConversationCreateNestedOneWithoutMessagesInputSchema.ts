import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationCreateWithoutMessagesInputSchema } from './ConversationCreateWithoutMessagesInputSchema';
import { ConversationUncheckedCreateWithoutMessagesInputSchema } from './ConversationUncheckedCreateWithoutMessagesInputSchema';
import { ConversationCreateOrConnectWithoutMessagesInputSchema } from './ConversationCreateOrConnectWithoutMessagesInputSchema';
import { ConversationWhereUniqueInputSchema } from './ConversationWhereUniqueInputSchema';

export const ConversationCreateNestedOneWithoutMessagesInputSchema: z.ZodType<Prisma.ConversationCreateNestedOneWithoutMessagesInput> = z.object({
  create: z.union([ z.lazy(() => ConversationCreateWithoutMessagesInputSchema),z.lazy(() => ConversationUncheckedCreateWithoutMessagesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ConversationCreateOrConnectWithoutMessagesInputSchema).optional(),
  connect: z.lazy(() => ConversationWhereUniqueInputSchema).optional()
}).strict();

export default ConversationCreateNestedOneWithoutMessagesInputSchema;
