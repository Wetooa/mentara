import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantWhereUniqueInputSchema } from './ConversationParticipantWhereUniqueInputSchema';
import { ConversationParticipantUpdateWithoutConversationInputSchema } from './ConversationParticipantUpdateWithoutConversationInputSchema';
import { ConversationParticipantUncheckedUpdateWithoutConversationInputSchema } from './ConversationParticipantUncheckedUpdateWithoutConversationInputSchema';

export const ConversationParticipantUpdateWithWhereUniqueWithoutConversationInputSchema: z.ZodType<Prisma.ConversationParticipantUpdateWithWhereUniqueWithoutConversationInput> = z.object({
  where: z.lazy(() => ConversationParticipantWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ConversationParticipantUpdateWithoutConversationInputSchema),z.lazy(() => ConversationParticipantUncheckedUpdateWithoutConversationInputSchema) ]),
}).strict();

export default ConversationParticipantUpdateWithWhereUniqueWithoutConversationInputSchema;
