import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantWhereUniqueInputSchema } from './ConversationParticipantWhereUniqueInputSchema';
import { ConversationParticipantCreateWithoutConversationInputSchema } from './ConversationParticipantCreateWithoutConversationInputSchema';
import { ConversationParticipantUncheckedCreateWithoutConversationInputSchema } from './ConversationParticipantUncheckedCreateWithoutConversationInputSchema';

export const ConversationParticipantCreateOrConnectWithoutConversationInputSchema: z.ZodType<Prisma.ConversationParticipantCreateOrConnectWithoutConversationInput> = z.object({
  where: z.lazy(() => ConversationParticipantWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ConversationParticipantCreateWithoutConversationInputSchema),z.lazy(() => ConversationParticipantUncheckedCreateWithoutConversationInputSchema) ]),
}).strict();

export default ConversationParticipantCreateOrConnectWithoutConversationInputSchema;
