import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantWhereUniqueInputSchema } from './ConversationParticipantWhereUniqueInputSchema';
import { ConversationParticipantUpdateWithoutConversationInputSchema } from './ConversationParticipantUpdateWithoutConversationInputSchema';
import { ConversationParticipantUncheckedUpdateWithoutConversationInputSchema } from './ConversationParticipantUncheckedUpdateWithoutConversationInputSchema';
import { ConversationParticipantCreateWithoutConversationInputSchema } from './ConversationParticipantCreateWithoutConversationInputSchema';
import { ConversationParticipantUncheckedCreateWithoutConversationInputSchema } from './ConversationParticipantUncheckedCreateWithoutConversationInputSchema';

export const ConversationParticipantUpsertWithWhereUniqueWithoutConversationInputSchema: z.ZodType<Prisma.ConversationParticipantUpsertWithWhereUniqueWithoutConversationInput> = z.object({
  where: z.lazy(() => ConversationParticipantWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ConversationParticipantUpdateWithoutConversationInputSchema),z.lazy(() => ConversationParticipantUncheckedUpdateWithoutConversationInputSchema) ]),
  create: z.union([ z.lazy(() => ConversationParticipantCreateWithoutConversationInputSchema),z.lazy(() => ConversationParticipantUncheckedCreateWithoutConversationInputSchema) ]),
}).strict();

export default ConversationParticipantUpsertWithWhereUniqueWithoutConversationInputSchema;
